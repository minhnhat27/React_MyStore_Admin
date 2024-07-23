import { useAntdMessage } from '../../App'
import { Breadcrumb, Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone } from '@ant-design/icons'
import categoryService from '../../services/products/categoryService'
import { useEffect } from 'react'
import { showError } from '../../services/commonService'

const breadcrumbItems = [
  {
    title: 'Product Attributes',
  },
  {
    title: 'Categories',
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

export default function Category() {
  const { showMessage } = useAntdMessage()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    setLoading(true)
    categoryService
      .getAll()
      .then((res) => setCategories(res.data))
      .catch((err) => showMessage.error(showError(err)))
      .finally(() => setLoading(false))
  }, [showMessage])

  const handleSave = () => {
    setSaveLoading(true)
    if (isUpdate) {
      categoryService
        .update(categoryId, form.getFieldsValue())
        .then((res) => {
          const newCategories = categories.filter((item) => item.id !== categoryId)
          setCategories([...newCategories, res.data])
          form.resetFields()
          setIsUpdate(false)
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      categoryService
        .create(form.getFieldsValue())
        .then((res) => {
          setCategories([...categories, res.data])
          form.resetFields()
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await categoryService
      .remove(id)
      .then(() => {
        setCategories(categories.filter((item) => item.id !== id))
        showMessage.success('Successfully')
      })
      .catch((err) => showMessage.error(showError(err)))
  }

  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsUpdate(true)
    setCategoryId(record.id)
  }
  const handleClear = () => {
    form.resetFields()
    setIsUpdate(false)
    setCategoryId('')
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
              dataSource={categories}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          <Card className="h-fit bg-white drop-shadow">
            <span className="text-gray-700 font-bold">Add new category</span>
            <Form form={form} disabled={saveLoading} onFinish={handleSave}>
              <div>
                <label
                  htmlFor="description "
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category name <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input
                    count={{
                      show: true,
                      max: 30,
                    }}
                    maxLength={30}
                    size="large"
                    placeholder="Category name..."
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
