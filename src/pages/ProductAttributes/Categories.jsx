import { Breadcrumb, Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip, App } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import { useEffect } from 'react'
import { showError } from '../../services/commonService'
import httpService from '../../services/http-service'
import { CATEGORY_API, MATERIAL_API } from '../../services/const'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Thuộc tính sản phẩm',
  },
  {
    title: 'Danh mục',
  },
]

const columns = (handleDelete, onEdit) => [
  {
    title: 'Tên',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: 'Hành động',
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

export default function Category() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await httpService.get(MATERIAL_API)
        setCategories(data)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

  const handleSave = async (values) => {
    setSaveLoading(true)
    try {
      if (isUpdate) {
        const data = await httpService.put(CATEGORY_API + `/${categoryId}`, values)
        setCategories((pre) => pre.map((item) => (item.id === categoryId ? data : item)))

        form.resetFields()
        setIsUpdate(false)
        message.success('Thành công')
      } else {
        const data = await httpService.post(CATEGORY_API, values)
        setCategories((pre) => [...pre, data])
        form.resetFields()
        message.success('Thành công')
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await httpService.del(CATEGORY_API + `/${categoryId}`)
      setCategories((pre) => pre.filter((item) => item.id !== id))
      message.success('Thành công')
    } catch (error) {
      message.error(showError(error))
    }
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
          <Card title="Danh mục" className="h-fit bg-white drop-shadow">
            <Form layout="vertical" form={form} disabled={saveLoading} onFinish={handleSave}>
              <Form.Item
                label="Danh mục"
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
                  placeholder="Áo thun..."
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
