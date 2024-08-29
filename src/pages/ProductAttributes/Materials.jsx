import { Breadcrumb, Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip, App } from 'antd'
import { useEffect, useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import materialService from '../../services/products/materialService'
import { showError } from '../../services/commonService'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Thuộc tính sản phẩm',
  },
  {
    title: 'Chất liệu',
  },
]

const columns = (handleDelete, onEdit) => [
  {
    title: 'Tên',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: 'Action',
    align: 'center',
    render: (_, record) => (
      <div className="cursor-pointer select-none text-lg inline-flex space-x-2">
        <Tooltip title="Chỉnh sửa">
          <Button className="flex items-center" onClick={() => onEdit(record)}>
            <EditTwoTone />
          </Button>
        </Tooltip>
        <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
          <Button danger className="flex items-center">
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
      </div>
    ),
  },
]

export default function Material() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [materials, setMaterials] = useState([])
  const [materialId, setMaterialId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await materialService.getAll()
        setMaterials(res.data)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

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
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      materialService
        .create(form.getFieldsValue())
        .then((res) => {
          setMaterials([...materials, res.data])
          form.resetFields()
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await materialService
      .remove(id)
      .then(() => {
        setMaterials(materials.filter((item) => item.id !== id))
        message.success('Thành công')
      })
      .catch((err) => message.error(showError(err)))
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
          <Card title="Chất liệu" className="h-fit bg-white drop-shadow">
            <Form layout="vertical" form={form} disabled={saveLoading} onFinish={handleSave}>
              <Form.Item
                label="Tên chất liệu"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input
                  count={{
                    show: true,
                    max: 25,
                  }}
                  maxLength={25}
                  size="large"
                  placeholder="Vải, thun, cotton,..."
                  allowClear
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-2">
                <Button type="primary" htmlType="submit" className="w-full" size="large">
                  {saveLoading ? <Spin /> : isUpdate ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button
                  disabled={!isUpdate || saveLoading}
                  onClick={handleClear}
                  className="w-full"
                  size="large"
                >
                  Làm mới
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  )
}
