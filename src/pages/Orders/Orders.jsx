import { useEffect, useState } from 'react'
import {
  formatDate,
  formatDateTime,
  formatVND,
  showError,
  toImageSrc,
} from '../../services/commonService'
import {
  App,
  Breadcrumb,
  Button,
  Divider,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd'
import { CompassOutlined, EyeTwoTone, HomeFilled } from '@ant-design/icons'
import httpService from '../../services/http-service'
import {
  CancelStatus,
  ConfirmedStatus,
  ORDER_API,
  OrderStatus,
  OrderStatusTagColor,
  ProcessingStatus,
  ReceivedStatus,
  RequiredNote,
} from '../../services/const'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Quản lý đơn hàng',
  },
]

const columns = (
  loading,
  paymentMethods,
  openOrderDetails,
  nextOrderStatus,
  cancelOrder,
  onOpenSendOrder,
) => [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (value) => <span className="font-semibold">#{value}</span>,
    width: 70,
  },
  {
    title: 'Tổng',
    dataIndex: 'total',
    render: (value) => <div className="text-lg font-semibold">{formatVND.format(value)}</div>,
    sorter: (a, b) => a.total - b.total,
  },
  {
    title: 'Thanh toán',
    dataIndex: 'total',
    align: 'center',
    render: (value, record) => (
      <Tag color={record.amountPaid >= value ? 'green' : 'red'}>
        {record.amountPaid >= value ? 'Đã thanh toán' : 'Chưa thanh toán'}
      </Tag>
    ),
    filters: [
      { value: true, text: 'Đã thanh toán' },
      { value: false, text: 'Chưa thanh toán' },
    ],
    onFilter: (value, record) =>
      value ? record.amountPaid >= record.total : record.amountPaid < record.total,
  },
  {
    title: 'Phương thức',
    dataIndex: 'paymentMethodName',
    align: 'center',
    filters: paymentMethods,
    onFilter: (value, record) => record.paymentMethod === value,
  },
  {
    title: 'Ngày đặt',
    dataIndex: 'orderDate',
    render: (value) => value !== null && formatDate(value),
    sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    width: 120,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'orderStatus',
    align: 'center',
    render: (value) => <Tag color={OrderStatusTagColor[value]}>{OrderStatus[value]}</Tag>,
    // filters: orderStatus,
    // onFilter: (value, record) => record.orderStatus === value,
  },
  {
    title: 'Hành động',
    align: 'center',
    dataIndex: 'id',
    width: 230,
    render: (value, record) => (
      <>
        {!(
          record.orderStatus === CancelStatus ||
          record.orderStatus === ReceivedStatus ||
          record.orderStatus === ConfirmedStatus
        ) && (
          <Popconfirm
            title={
              <>
                Duyệt đơn thành{' '}
                <div className="font-semibold">{OrderStatus[record.orderStatus + 1]}</div>
              </>
            }
            loading={loading}
            onConfirm={() => nextOrderStatus(value, record.orderStatus)}
          >
            <Button className="m-1" type="primary" danger>
              Duyệt
            </Button>
          </Popconfirm>
        )}
        <Tooltip title="Xem chi tiết">
          <Button onClick={() => openOrderDetails(value)} className="m-1">
            <EyeTwoTone />
          </Button>
        </Tooltip>
      </>
    ),
  },
  {
    // title: 'Hành động',
    align: 'center',
    dataIndex: 'orderStatus',
    width: 100,
    render: (value, record) => (
      <>
        {value === ProcessingStatus ? (
          <Popconfirm
            title="Xác nhận hủy đơn!"
            loading={loading}
            onConfirm={() => cancelOrder(record.id)}
          >
            <Button type="link" danger>
              Hủy đơn
            </Button>
          </Popconfirm>
        ) : (
          value === ConfirmedStatus && (
            <Button onClick={() => onOpenSendOrder(record.id)} type="dashed" danger>
              Giao đơn
            </Button>
          )
        )}
      </>
    ),
  },
]

export default function Orders() {
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const [sendOrderOpen, setSendOrderOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [orderDetails, setOrderDetails] = useState()

  const [orderId, setOrderId] = useState()
  const [loading, setLoading] = useState(false)
  const [sendOrderLoading, setSendOrderLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [orderStatus, setOrderStatus] = useState('0')
  const [openDrawer, setOpenDrawer] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (searchKey) setSearchLoading(true)

        const params =
          orderStatus === '7'
            ? { page, pageSize, key: searchKey }
            : { page, pageSize, key: searchKey, orderStatus }

        const data = await httpService.getWithParams(ORDER_API + '/all', params)

        var newPaymentMethod = [
          ...new Set(data?.items?.map((order) => order.paymentMethodName)),
        ].map((value) => {
          return {
            value: value,
            text: value,
          }
        })

        setPaymentMethods(newPaymentMethod)
        setOrders(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        setSearchKey('')
        message.error(showError(error))
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, orderStatus, message])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const onChange = (key) => {
    setPage(1)
    setOrderStatus(key)
  }

  const onCloseDrawer = () => {
    setOpenDrawer(false)
  }

  const openOrderDetails = async (id) => {
    setOrderDetails(undefined)
    setOpenDrawer(true)
    try {
      setOrderLoading(true)
      const data = await httpService.get(ORDER_API + `/${id}`)
      setOrderDetails(data)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setOrderLoading(false)
    }
  }

  const nextOrderStatus = async (id, currentStatus) => {
    try {
      setLoading(true)
      const data = { currentStatus }
      await httpService.put(ORDER_API + `/next-status/${id}`, data)
      setOrders((pre) => pre.filter((e) => e.id !== id))
      message.success(`Đã duyệt đơn ${id}`)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (id) => {
    try {
      setLoading(true)
      await httpService.del(ORDER_API + `/${id}`)
      setOrders((pre) => pre.filter((e) => e.id !== id))
    } catch (error) {
      message.error(showError(error))
    } finally {
      setLoading(false)
    }
  }

  const onOpenSendOrder = (id) => {
    setOrderId(id)
    setSendOrderOpen(true)
  }

  const sendOrder = async (values) => {
    try {
      setSendOrderLoading(true)
      await httpService.put(ORDER_API + `/shipping/${orderId}`, values)

      message.success('Đã gửi đơn hàng cho đơn vị vận chuyển')
      setOrderId(undefined)
      setOrders((pre) => pre.filter((e) => e.id !== orderId))
      setSendOrderOpen(false)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setSendOrderLoading(false)
    }
  }

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex space-x-2 py-4">
            <Input.Search
              size="large"
              allowClear
              placeholder="Mã đơn hàng, phương thức,..."
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            <Button size="large" type="primary">
              Xuất đơn hàng
            </Button>
          </div>
          <Tabs
            tabBarStyle={{ margin: 0 }}
            onChange={onChange}
            className="w-full"
            items={Object.entries(OrderStatus).map(([key, value]) => ({
              label: value,
              key: key,
            }))}
            activeKey={orderStatus}
          />
          <Table
            columns={columns(
              loading,
              paymentMethods,
              openOrderDetails,
              nextOrderStatus,
              cancelOrder,
              onOpenSendOrder,
            )}
            dataSource={orders}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
            loading={loading}
          />

          <Pagination
            hideOnSinglePage
            className="py-4"
            align="center"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`}
            defaultPageSize={pageSize}
            defaultCurrent={page}
            showSizeChanger
            onChange={(newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
          />
        </div>
      </div>

      <Modal
        open={sendOrderOpen}
        title="Quy cách đóng gói (Đơn vị vận chuyển: Giao hàng nhanh)"
        okText="Xác nhận"
        cancelText="Đóng"
        centered
        confirmLoading={sendOrderLoading}
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        cancelButtonProps={{ disabled: sendOrderLoading }}
        onCancel={() => setSendOrderOpen(false)}
        maskClosable={false}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            clearOnDestroy
            initialValues={{
              requiredNote: 0,
            }}
            onFinish={sendOrder}
          >
            {dom}
          </Form>
        )}
      >
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name="requiredNote"
            label="Yêu cầu giao hàng"
            rules={[{ required: true, message: 'Vui lòng chọn yêu cầu' }]}
          >
            <Select
              options={Object.entries(RequiredNote).map(([key, value]) => ({
                value: parseInt(key),
                label: value,
              }))}
              placeholder="Chọn"
              className="w-full"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="weight"
            label="Cân nặng"
            rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}
          >
            <InputNumber
              formatter={(value) => `${value}(g)`}
              parser={(value) => value?.replace('(g)', '')}
              className="w-full"
              size="large"
            />
          </Form.Item>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Form.Item
            name="length"
            label="Chiều dài"
            rules={[{ required: true, message: 'Vui lòng nhập chiều dài' }]}
          >
            <InputNumber
              formatter={(value) => `${value}(cm)`}
              parser={(value) => value?.replace('(cm)', '')}
              className="w-full"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="width"
            label="Chiều rộng"
            rules={[{ required: true, message: 'Vui lòng nhập chiều rộng' }]}
          >
            <InputNumber
              formatter={(value) => `${value}(cm)`}
              parser={(value) => value?.replace('(cm)', '')}
              className="w-full"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="height"
            label="Chiều cao"
            rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}
          >
            <InputNumber
              formatter={(value) => `${value}(cm)`}
              parser={(value) => value?.replace('(cm)', '')}
              className="w-full"
              size="large"
            />
          </Form.Item>
        </div>
      </Modal>

      <Drawer
        open={openDrawer}
        destroyOnClose
        loading={orderLoading}
        onClose={onCloseDrawer}
        title="Chi tiết đơn hàng"
        footer={
          orderDetails && (
            <>
              <div className="py-1">
                Thời gian đặt hàng: {formatDateTime(orderDetails.orderDate)}
              </div>
              <div>Giảm giá: {formatVND.format(orderDetails.voucherDiscount)}</div>
              <div>Phí vận chuyển: {formatVND.format(orderDetails.shippingCost)}</div>
              <div>
                Tổng cộng:{' '}
                <span className="text-lg font-semibold">
                  {formatVND.format(orderDetails.total)}
                </span>
              </div>
            </>
          )
        }
      >
        {orderDetails && (
          <>
            <div className="flex items-center gap-1">
              <CompassOutlined className="text-xl text-red-600" />
              <div className="font-bold inline-block truncate">{orderDetails.receiver}</div>
            </div>
            <div>{orderDetails.deliveryAddress}</div>
            <Divider />
            <List
              itemLayout="vertical"
              size="large"
              dataSource={orderDetails.productOrderDetails}
              renderItem={(item) => (
                <List.Item style={{ padding: 0 }} key={item.productName}>
                  <List.Item.Meta
                    avatar={
                      <Image
                        width={80}
                        height={100}
                        alt={item.productName}
                        className="object-cover"
                        src={toImageSrc(item.imageUrl)}
                      />
                    }
                    title={<div className="truncate">{item.productName}</div>}
                    description={
                      <>
                        <div>
                          {item.quantity} x {formatVND.format(item.price)}{' '}
                          <span className="line-through text-xs">
                            {formatVND.format(item.originPrice)}
                          </span>
                        </div>
                        <div>Thành tiền: {formatVND.format(item.price * item.quantity)}</div>
                        <div className="text-gray-500 font-semibold">Phân loại: {item.variant}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Drawer>
    </>
  )
}
