import { Button, Card, Form, Input, Popconfirm, Spin, Table, Tooltip, App, Switch, Tag } from 'antd'
import { useState } from 'react'
import { DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import { useEffect } from 'react'
import { showError } from '../../services/commonService'
import httpService from '../../services/http-service'
import { AdminRole, EmployeeRole, PAYMENT_API } from '../../services/const'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import { useAuth } from '../../App'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Phương thức thanh toán',
  },
]

const columns = (roles, handleDelete, onEdit) => [
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
        {roles?.includes(AdminRole) && (
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger className="flex items-center">
              <DeleteOutlined className="text-red-500" />
            </Button>
          </Popconfirm>
        )}
      </div>
    ),
  },
]

export default function Payments() {
  const { message } = App.useApp()

  const { state } = useAuth()

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
        const data = await httpService.get(PAYMENT_API)
        setPayments(data)
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
        const data = await httpService.put(PAYMENT_API + `/${paymentId}`, values)
        const newPayments = payments.map((item) => (item.id === paymentId ? data : item))
        setPayments(newPayments)
        form.resetFields()
        setIsUpdate(false)
        message.success('Thành công')
      } else {
        const data = await httpService.post(PAYMENT_API, values)
        setPayments([...payments, data])
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
      await httpService.del(PAYMENT_API + `/${id}`)
      setPayments(payments.filter((item) => item.id !== id))
      message.success('Thành công')
    } catch (error) {
      message.error(showError(error))
    }
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
        <BreadcrumbLink className="py-2" breadcrumbItems={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-2 drop-shadow">
            <Table
              columns={columns(state.roles, handleDelete, onEdit)}
              dataSource={payments}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          {(state.roles?.includes(AdminRole) ||
            (state.roles?.includes(EmployeeRole) && isUpdate)) && (
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
          )}
        </div>
      </div>
    </>
  )
}
