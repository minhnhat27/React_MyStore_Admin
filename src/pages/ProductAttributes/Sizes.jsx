import { Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip, App } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import { useEffect } from 'react'
import { showError } from '../../services/commonService'
import httpService from '../../services/http-service'
import { SIZE_API } from '../../services/const'
import BreadcrumbLink from '../../components/BreadcrumbLink'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Thuộc tính sản phẩm',
  },
  {
    title: 'Kích cỡ',
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

export default function Sizes() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [sizes, setSizes] = useState([])
  const [sizeId, setSizeId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await httpService.get(SIZE_API)
        setSizes(data)
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
        const data = await httpService.put(SIZE_API + `/${sizeId}`, values)

        setSizes((pre) => pre.map((item) => (item.id === sizeId ? data : item)))
        form.resetFields()
        setIsUpdate(false)
        message.success('Thành công')
      } else {
        const data = await httpService.post(SIZE_API, values)
        setSizes((pre) => [...pre, data])
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
      await httpService.del(SIZE_API + `/${sizeId}`)
      setSizes((pre) => pre.filter((item) => item.id !== id))
      message.success('Thành công')
    } catch (error) {
      message.error(showError(error))
    }
  }

  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsUpdate(true)
    setSizeId(record.id)
  }
  const handleClear = () => {
    form.resetFields()
    setIsUpdate(false)
    setSizeId('')
  }
  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-2 drop-shadow">
            <Table
              columns={columns(handleDelete, onEdit)}
              dataSource={sizes}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          <Card title="Size" className="h-fit sticky top-28 bg-white drop-shadow">
            <Form layout="vertical" form={form} disabled={saveLoading} onFinish={handleSave}>
              <Form.Item
                label="Tên size"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên size' }]}
              >
                <Input
                  count={{
                    show: true,
                    max: 25,
                  }}
                  maxLength={25}
                  size="large"
                  placeholder="S, M, 24, 25..."
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
