import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { formatDate, formatVND, showError } from '../../services/commonService'
import { Breadcrumb, Button, Input, Pagination, Table, Tag, message } from 'antd'
import { HomeFilled } from '@ant-design/icons'
import httpService from '../../services/http-service'
import { ORDER_API } from '../../services/api-urls'
import { OrderStatus } from '../../services/const'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Đơn hàng',
  },
]

export default function Orders() {
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [paymentMethods, setPaymentMethods] = useState([])
  const [orderStatus, setOrderStatus] = useState([])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (value) => <span className="font-semibold">#{value}</span>,
      width: 70,
    },
    {
      title: 'Tổng',
      dataIndex: 'total',
      render: (value) => formatVND.format(value),
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
      onFilter: (value, record) => record.paymentMethod.indexOf(value) === 0,
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
      render: (value) => OrderStatus[value],
      filters: orderStatus,
      onFilter: (value, record) => record.orderStatus === value,
    },
    // {
    //   title: 'UserId',
    //   dataIndex: 'userId',
    //   render: (value) => <div className="w-16 md:w-24 lg:w-36 2xl:w-full truncate">{value}</div>,
    // },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, record) => (
        <Link to={`order-detail/${record.id}`}>
          <Button>Chi tiết</Button>
        </Link>
      ),
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        searchKey ? setSearchLoading(true) : setLoading(true)
        const params = { page, pageSize, key: searchKey }
        const data = await httpService.getWithParams(ORDER_API + '/all', params)

        var newPaymentMethod = [...new Set(data?.items?.map((order) => order.paymentMethod))].map(
          (value) => {
            return {
              value: value,
              text: value,
            }
          },
        )

        var newOrderStatus = [...new Set(data?.items?.map((order) => order.orderStatus))].map(
          (value) => {
            return {
              value: value,
              text: OrderStatus[value],
            }
          },
        )

        setPaymentMethods(newPaymentMethod)
        setOrderStatus(newOrderStatus)

        setOrders(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        message.error(showError(error))
        setSearchKey('')
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

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

          <Table
            columns={columns}
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
    </>
  )
}
