import { useAntdMessage } from '../../App'
import { Breadcrumb, Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone } from '@ant-design/icons'
import materialService from '../../services/products/materialService'
import { useEffect } from 'react'
import { showError } from '../../services/commonService'

const breadcrumbItems = [
  {
    title: 'Product Attributes',
  },
  {
    title: 'Materials',
  },
]

const columns = (handleDelete, onEdit) => [
  {
    title: 'Name',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: 'Action',
    align: 'center',
    render: (_, record) => (
      <div className="space-x-4 cursor-pointer select-none text-lg">
        <Tooltip title="Edit">
          <EditTwoTone onClick={() => onEdit(record)} />
        </Tooltip>
        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
          <DeleteOutlined className="text-red-500" />
        </Popconfirm>
      </div>
    ),
  },
]

export default function Material() {
  const { showMessage } = useAntdMessage()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [materials, setMaterials] = useState([])
  const [materialId, setMaterialId] = useState('')

  useEffect(() => {
    setLoading(true)
    materialService
      .getAll()
      .then((res) => setMaterials(res.data))
      .catch((err) => showMessage.error(showError(err)))
      .finally(() => setLoading(false))
  }, [showMessage])

  const handleSave = () => {
    setSaveLoading(true)
    if (isUpdate) {
      materialService
        .update(materialId, form.getFieldsValue())
        .then((res) => {
          const newMaterials = materials.filter((item) => item.id !== materialId)
          setMaterials([...newMaterials, res.data])
          form.resetFields()
          setIsUpdate(false)
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      materialService
        .create(form.getFieldsValue())
        .then((res) => {
          setMaterials([...materials, res.data])
          form.resetFields()
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await materialService
      .remove(id)
      .then(() => {
        setMaterials(materials.filter((item) => item.id !== id))
        showMessage.success('Successfully')
      })
      .catch((err) => showMessage.error(showError(err)))
  }

  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsUpdate(true)
    setMaterialId(record.id)
  }
  const handleClear = () => {
    form.resetFields()
    setIsUpdate(false)
    setMaterialId('')
  }
  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          {/* <div className="p-2 h-fit md:col-span-2 bg-white rounded-lg drop-shadow"></div> */}
          <Card className="md:col-span-2 drop-shadow">
            <Table
              columns={columns(handleDelete, onEdit)}
              dataSource={materials}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          <Card className="h-fit bg-white drop-shadow">
            <span className="text-gray-700 font-bold">Add new material</span>
            <Form form={form} disabled={saveLoading} onFinish={handleSave}>
              <div>
                <label
                  htmlFor="description "
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Material name <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input
                    count={{
                      show: true,
                      max: 30,
                    }}
                    maxLength={30}
                    size="large"
                    placeholder="Material name..."
                    allowClear
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="primary" htmlType="submit" className="w-full" size="large">
                  {saveLoading ? <Spin /> : isUpdate ? 'Update' : 'Save'}
                </Button>
                <Button
                  disabled={!isUpdate || saveLoading}
                  onClick={handleClear}
                  className="w-full"
                  size="large"
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  )
}
