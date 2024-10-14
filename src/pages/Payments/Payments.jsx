import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Spin,
  Table,
  Tooltip,
  App,
  Switch,
  Tag,
} from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import paymentService from '../../services/payments/paymentService'
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
    title: 'Kích hoạt',
    dataIndex: 'isActive',
    align: 'center',
    render: (value) =>
      value ? <Tag color="#87d068">Kích hoạt</Tag> : <Tag color="#FF4D4F">Vô hiệu</Tag>,
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

export default function Payments() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)

  const [payments, setPayments] = useState([])
  const [paymentId, setpaymentId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await paymentService.getAll()
        setPayments(res.data)
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
      paymentService
        .update(paymentId, form.getFieldsValue())
        .then((res) => {
          const newPayments = payments.map((item) => (item.id === paymentId ? res.data : item))
          setPayments(newPayments)

          form.resetFields()
          setIsUpdate(false)
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      paymentService
        .create(form.getFieldsValue())
        .then((res) => {
          setPayments([...payments, res.data])
          form.resetFields()
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await paymentService
      .remove(id)
      .then(() => {
        setPayments(payments.filter((item) => item.id !== id))
        message.success('Thành công')
      })
      .catch((err) => message.error(showError(err)))
  }

  const onEdit = (record) => {
    form.setFieldsValue(record)
    setIsUpdate(true)
    setpaymentId(record.id)
  }
  const handleClear = () => {
    form.resetFields()
    setIsUpdate(false)
    setpaymentId('')
  }
  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-2 drop-shadow">
            <Table
              columns={columns(handleDelete, onEdit)}
              dataSource={payments}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          <Card title="Phương thức" className="h-fit bg-white drop-shadow">
            <Form layout="vertical" form={form} disabled={saveLoading} onFinish={handleSave}>
              <Form.Item
                label="Tên phương thức"
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
                  placeholder="VNPay, MoMo,..."
                  allowClear
                />
              </Form.Item>

              <Form.Item label="Kích hoạt" name="isActive">
                <Switch defaultChecked={false} />
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