import {
  DeleteOutlined,
  HomeFilled,
  PlusCircleTwoTone,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Switch,
  Table,
  Tooltip,
} from 'antd'
import { useEffect, useState } from 'react'
import httpService from '../../services/http-service'
import { VOUCHER_API } from '../../services/const'
import { formatDateTime, formatVND, showError } from '../../services/commonService'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Quản lý mã giảm giá',
  },
]

const columns = (handleDeleteVoucher, onUpdateGlobal, onOpenUserVoucher) => [
  {
    title: 'Mã giảm giá',
    dataIndex: 'code',
    fixed: 'left',
    maxWidth: 100,
    render: (value) => <div className="truncate w-24">{value}</div>,
  },
  {
    title: 'Số tiền giảm',
    dataIndex: 'discountAmount',
    render: (value, record) => (value ? formatVND.format(value) : `${record.discountPercent}%`),
  },
  {
    title: 'Đơn tối thiểu',
    dataIndex: 'minOrder',
    render: (value) => formatVND.format(value),
  },
  {
    title: 'Giảm tối đa',
    dataIndex: 'maxDiscount',
    render: (value) => formatVND.format(value),
  },
  {
    title: 'Ngày hiệu lực',
    dataIndex: 'startDate',
    render: (value) => formatDateTime(value),
  },
  {
    title: 'Ngày hết hạn',
    dataIndex: 'endDate',
    render: (value) => formatDateTime(value),
  },
  {
    align: 'center',
    title: (
      <>
        Mã hệ thống
        <Tooltip title="Ai cũng có thể áp dụng">
          <QuestionCircleOutlined className="ml-2" />
        </Tooltip>
      </>
    ),
    dataIndex: 'isGlobal',
    render: (value, record) => (
      <Switch onChange={(v) => onUpdateGlobal(record.code, v)} value={value} />
    ),
  },
  {
    title: 'Hành động',
    dataIndex: 'code',
    align: 'center',
    render: (value, record) => (
      <>
        <Popconfirm title="Xác nhận xóa mã này" onConfirm={() => handleDeleteVoucher(value)}>
          <Button className="m-1" danger>
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
        {record.isGlobal || (
          <Tooltip title="Thêm người dùng cho mã này">
            <Button onClick={() => onOpenUserVoucher(record.code)} className="m-1">
              <PlusCircleTwoTone />
            </Button>
          </Tooltip>
        )}
      </>
    ),
  },
]

export default function Vouchers() {
  const [form] = Form.useForm()
  const [openAddVoucher, setOpenAddVoucher] = useState(false)
  const [openUserVoucher, setOpenUserVoucher] = useState(false)

  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [getUserLoading, setGetUserLoading] = useState(false)

  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState([])

  const [userVoucher, setUserVoucher] = useState([])
  const [haveVoucher, setHaveVoucher] = useState([])

  const discountType = Form.useWatch('discountType', form)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await httpService.get(VOUCHER_API + '/all')
        setVoucher(data)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

  const onCreate = async (values) => {
    try {
      setCreateLoading(true)
      const data = {
        ...values,
        isGlobal: values.isGlobal ?? false,
        maxDiscount: values.maxDiscount ?? values.discountAmount,
        startDate: values.startDate.format(),
        endDate: values.endDate.format(),
      }
      const res = await httpService.post(VOUCHER_API, data)
      setVoucher((pre) => pre.concat(res))
      message.success('Tạo mã giảm giá thành công')
      setOpenAddVoucher(false)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteVoucher = async (code) => {
    try {
      await httpService.del(`${VOUCHER_API}/${code}`)
      setVoucher((pre) => pre.filter((e) => e.code !== code))
      message.success('Đã xóa mã giảm giá')
    } catch (error) {
      message.error(showError(error))
    }
  }

  const onUpdateGlobal = async (code, value) => {
    try {
      const res = await httpService.put(`${VOUCHER_API}/${code}`, { enable: value })
      message.success('Cập nhật thành công')
      setVoucher((pre) => pre.map((v) => (v.code === code ? { ...v, isGlobal: res } : v)))
    } catch (error) {
      message.error(showError(error))
    }
  }

  const onOpenUserVoucher = async (cd) => {
    try {
      setOpenUserVoucher(true)
      setGetUserLoading(true)
      setCode(cd)
      const data = await httpService.get(`${VOUCHER_API}/user/${cd}`)
      setHaveVoucher(data.haveVoucher)
      setUserVoucher(
        data.userVoucher.map((item) => ({
          value: item.id,
          label: item.fullname + ' - ' + item?.email,
        })),
      )
    } catch (error) {
      message.error(showError(error))
    } finally {
      setGetUserLoading(false)
    }
  }

  const onChangeUserVoucher = async (values) => {
    try {
      setCreateLoading(true)
      const data = await httpService.put(`${VOUCHER_API}/user/${code}`, values)
      setHaveVoucher(data)
      setCode('')
      message.success('Cập nhật thành công')
      setOpenUserVoucher(false)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex justify-end py-4">
            <Button size="large" type="primary" onClick={() => setOpenAddVoucher(true)}>
              + Tạo mã giảm giá
            </Button>
          </div>

          <Table
            columns={columns(handleDeleteVoucher, onUpdateGlobal, onOpenUserVoucher)}
            dataSource={voucher}
            rowKey={(record) => record.code}
            className="overflow-x-auto overflow-y-hidden"
            rowHoverable
            pagination={false}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        open={openAddVoucher}
        cancelText="Đóng"
        title="Tạo mã giảm giá"
        confirmLoading={createLoading}
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpenAddVoucher(false)}
        centered
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="voucher"
            initialValues={{
              discountType: 0,
            }}
            onFinish={onCreate}
          >
            {dom}
          </Form>
        )}
      >
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã cần tạo' }]}
          >
            <Input maxLength={50} showCount size="large" />
          </Form.Item>
          <Form.Item
            name="minOrder"
            label="Đơn tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền giảm' }]}
          >
            <InputNumber
              className="w-full"
              size="large"
              min={1}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày hiệu lực"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hiệu lực' }]}
          >
            <DatePicker className="w-full" size="large" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày hết hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
          >
            <DatePicker className="w-full" size="large" />
          </Form.Item>
          <div className="col-span-full grid grid-cols-4 gap-2">
            <Form.Item
              className="col-span-3"
              name="discountType"
              label="Hình thức giảm giá"
              rules={[{ required: true, message: 'Vui lòng nhập mã cần tạo' }]}
            >
              <Radio.Group>
                <Radio value={0}>Giảm theo phần trăm</Radio>
                <Radio value={1}>Giảm giá trực tiếp</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="isGlobal" label="Mã hệ thống">
              <Switch />
            </Form.Item>
          </div>
          {discountType ? (
            <Form.Item
              name="discountAmount"
              label="Số tiền giảm"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền giảm' }]}
            >
              <InputNumber
                className="w-full"
                size="large"
                min={1}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="discountPercent"
                label="Phần trăm giảm"
                rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá' }]}
              >
                <InputNumber
                  className="w-full"
                  size="large"
                  min={1}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace('%', '')}
                />
              </Form.Item>
              <Form.Item
                name="maxDiscount"
                label="Giảm tối đa"
                rules={[{ required: true, message: 'Vui lòng tiền giảm tối đa' }]}
              >
                <InputNumber
                  className="w-full"
                  size="large"
                  min={1}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={openUserVoucher}
        cancelText="Đóng"
        title="Thêm người dùng sỡ hữu mã giảm giá"
        confirmLoading={createLoading}
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpenUserVoucher(false)}
        centered
        destroyOnClose
        maskClosable={false}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            clearOnDestroy
            name="userVoucher"
            initialValues={{ haveVoucher }}
            onFinish={(values) => onChangeUserVoucher(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item name="haveVoucher" label="Chọn người dùng">
          <Select
            mode="multiple"
            optionFilterProp="label"
            options={userVoucher}
            loading={getUserLoading}
            maxLength={50}
            size="large"
          />
        </Form.Item>
      </Modal>
    </>
  )
}
