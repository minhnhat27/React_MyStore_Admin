import { useSearchParams } from 'react-router-dom'
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
  Image,
  Input,
  List,
  Pagination,
  Popconfirm,
  Table,
  Tabs,
  Tag,
} from 'antd'
import { CompassOutlined, HomeFilled } from '@ant-design/icons'
import httpService from '../../services/http-service'
import {
  CancelStatus,
  ConfirmedStatus,
  ORDER_API,
  OrderStatus,
  ProcessingStatus,
  ReceivedStatus,
} from '../../services/const'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Đơn hàng',
  },
]

const columns = (loading, paymentMethods, openOrderDetails, nextOrderStatus, cancelOrder) => [
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
    dataIndex: 'paymentMethod',
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
    render: (value) => <Tag color="#22c55e">{OrderStatus[value]}</Tag>,
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
            onConfirm={() => nextOrderStatus(value)}
          >
            <Button className="m-1" type="primary" danger>
              Duyệt
            </Button>
          </Popconfirm>
        )}
        <Button onClick={() => openOrderDetails(value)} className="m-1">
          Chi tiết
        </Button>
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
            <Popconfirm title="Xác nhận gọi đơn vị vận chuyển!">
              <Button type="dashed" danger>
                Giao đơn
              </Button>
            </Popconfirm>
          )
        )}
      </>
    ),
  },
]

export default function Orders() {
  const { notification, message } = App.useApp()
  const [orders, setOrders] = useState([])
  const [orderDetails, setOrderDetails] = useState()

  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState(() => searchParams.get('key') || '')

  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(() =>
    searchParams.get('page') ? parseInt(searchParams.get('page')) : 1,
  )
  const [pageSize, setPageSize] = useState(() =>
    searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')) : 10,
  )
  const [paymentMethods, setPaymentMethods] = useState([])
  const [orderStatus, setOrderStatus] = useState(() => searchParams.get('orderStatus') || '0')
  const [openDrawer, setOpenDrawer] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (searchKey) setSearchLoading(true)
        const params = { page, pageSize, key: searchKey }
        setSearchParams({ ...params, orderStatus: orderStatus })
        let data
        if (orderStatus === 'all') {
          data = await httpService.getWithParams(ORDER_API + '/all', params)
        } else {
          data = await httpService.getWithParams(ORDER_API + `/status/${orderStatus}`, params)
        }

        var newPaymentMethod = [...new Set(data?.items?.map((order) => order.paymentMethod))].map(
          (value) => {
            return {
              value: value,
              text: value,
            }
          },
        )

        setPaymentMethods(newPaymentMethod)
        setOrders(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        setSearchKey('')
        notification.error({ message: 'Thất bại', description: showError(error) })
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, orderStatus, notification, setSearchParams])

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

  const nextOrderStatus = async (id) => {
    try {
      setLoading(true)
      await httpService.put(ORDER_API + `/next-status/${id}`)
      setOrders((pre) => pre.filter((e) => e.id !== id))
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

  const sendOrder = async (id) => {
    
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
            onChange={onChange}
            type="card"
            className="w-full"
            items={Object.entries({ all: 'Tất cả', ...OrderStatus }).map(([key, value]) => {
              return {
                label: value,
                key: key,
                children: (
                  <Table
                    columns={columns(
                      loading,
                      paymentMethods,
                      openOrderDetails,
                      nextOrderStatus,
                      cancelOrder,
                    )}
                    dataSource={orders}
                    rowKey={(record) => record.id}
                    className="overflow-x-auto"
                    rowHoverable
                    pagination={false}
                    loading={loading}
                  />
                ),
              }
            })}
            activeKey={orderStatus}
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

      <Drawer
        open={openDrawer}
        destroyOnClose
        loading={orderLoading}
        onClose={onCloseDrawer}
        title="Chi tiết đơn hàng"
        footer={
          orderDetails && (
            <>
              <div className="py-1">Ngày đặt hàng: {formatDateTime(orderDetails.orderDate)}</div>
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
                        height={80}
                        alt={item.productName}
                        className="object-cover"
                        src={toImageSrc(item.imageUrl)}
                      />
                    }
                    title={<div className="truncate">{item.productName}</div>}
                    description={
                      <>
                        <div>
                          {item.quantity} x {formatVND.format(item.price)}
                        </div>
                        <div className="text-gray-500 font-semibold">
                          Phân loại: {item.colorName} - {item.sizeName}
                        </div>
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
