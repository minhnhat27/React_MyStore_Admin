import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import orderService from '../../services/orders/orderService'
import { formatDate, formatUSD } from '../../services/commonService'
import { Breadcrumb, Button, Input, Pagination, Table, Tag, message } from 'antd'

const breadcrumbItems = [
  {
    title: 'Orders',
  },
]

export default function Orders() {
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

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
      title: 'Total',
      dataIndex: 'total',
      render: (value) => formatUSD.format(value),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      align: 'center',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'} key={value}>
          {value ? 'Paid'.toUpperCase() : 'Unpaid'.toUpperCase()}
        </Tag>
      ),
      filters: [
        { value: true, text: 'Paid' },
        { value: false, text: 'Unpaid' },
      ],
      onFilter: (value, record) => record.paid === value,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      align: 'center',
      filters: paymentMethods,
      onFilter: (value, record) => record.paymentMethod.indexOf(value) === 0,
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      render: (value) => value !== null && formatDate(value),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      width: 120,
    },
    {
      title: 'Order Status',
      dataIndex: 'orderStatus',
      align: 'center',
      filters: orderStatus,
      onFilter: (value, record) => record.orderStatus.indexOf(value) === 0,
    },
    {
      title: 'User Id',
      dataIndex: 'userId',
      render: (value) => <div className="w-16 md:w-24 lg:w-36 2xl:w-full truncate">{value}</div>,
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <Link to={`order-detail/${record.id}`}>
          <Button>Detail</Button>
        </Link>
      ),
    },
  ]

  useEffect(() => {
    searchKey ? setSearchLoading(true) : setLoading(true)
    orderService
      .getAll(currentPage, currentPageSize, searchKey)
      .then((res) => {
        var newPaymentMethod = [
          ...new Set(res.data?.items?.map((order) => order.paymentMethod)),
        ].map((value) => {
          return {
            value: value,
            text: value,
          }
        })

        var newOrderStatus = [...new Set(res.data?.items?.map((order) => order.orderStatus))].map(
          (value) => {
            return {
              value: value,
              text: value,
            }
          },
        )

        setPaymentMethods(newPaymentMethod)
        setOrderStatus(newOrderStatus)

        setOrders(res.data?.items)
        setTotalItems(res.data?.totalItems)
      })
      .catch((err) => {
        message.error(err.response?.data || err.message)
        setSearchKey('')
      })
      .finally(() => {
        setLoading(false)
        setSearchLoading(false)
      })
  }, [currentPage, currentPageSize, searchKey])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
        <div className="py-2 px-4 bg-white rounded-lg drop-shadow">
          <span className="text-gray-600 text-sm">
            Tip search by Order ID: Each order is provided with a unique ID, which you can rely on
            to find the exact product you need.
          </span>
          <div className="py-4 text-sm flex items-center space-x-2">
            <Input.Search
              size="large"
              allowClear
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            <Button size="large" type="primary">
              Export all order
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
            className="text-center mt-4"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            defaultPageSize={currentPageSize}
            defaultCurrent={currentPage}
            showSizeChanger={true}
            onChange={(newPage, newPageSize) => {
              setCurrentPage(newPage)
              setCurrentPageSize(newPageSize)
            }}
          />
        </div>
      </div>
    </>
  )
}
