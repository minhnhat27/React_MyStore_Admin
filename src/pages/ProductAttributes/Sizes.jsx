import { Breadcrumb, Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip, App } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import sizeService from '../../services/products/sizeService'
import { useEffect } from 'react'
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
        const res = await sizeService.getAll()
        setSizes(res.data)
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
      sizeService
        .update(sizeId, form.getFieldsValue())
        .then((res) => {
          const newsizes = sizes.filter((item) => item.id !== sizeId)
          setSizes([...newsizes, res.data])
          form.resetFields()
          setIsUpdate(false)
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      sizeService
        .create(form.getFieldsValue())
        .then((res) => {
          setSizes([...sizes, res.data])
          form.resetFields()
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await sizeService
      .remove(id)
      .then(() => {
        setSizes(sizes.filter((item) => item.id !== id))
        message.success('Thành công')
      })
      .catch((err) => message.error(showError(err)))
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
        <Breadcrumb className="py-2" items={breadcrumbItems} />
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
          <Card title="Size" className="h-fit bg-white drop-shadow">
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
