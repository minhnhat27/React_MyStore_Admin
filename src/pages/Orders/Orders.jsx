import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import orderService from '../../services/orders/orderService'
import { formatDate, formatUSD, showError } from '../../services/commonService'
import { Breadcrumb, Button, Input, Pagination, Table, Tag, message } from 'antd'
import { HomeFilled } from '@ant-design/icons'

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
      title: 'Tổng',
      dataIndex: 'total',
      render: (value) => formatUSD.format(value),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paid',
      align: 'center',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'} key={value}>
          {value ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
      filters: [
        { value: true, text: 'Đã thanh toán' },
        { value: false, text: 'Chưa thanh toán' },
      ],
      onFilter: (value, record) => record.paid === value,
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
      align: 'center',
      filters: orderStatus,
      onFilter: (value, record) => record.orderStatus.indexOf(value) === 0,
    },
    {
      title: 'UserId',
      dataIndex: 'userId',
      render: (value) => <div className="w-16 md:w-24 lg:w-36 2xl:w-full truncate">{value}</div>,
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, record) => (
        <Link to={`order-detail/${record.id}`}>
          <Button>Detail</Button>
        </Link>
      ),
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        searchKey ? setSearchLoading(true) : setLoading(true)
        const res = await orderService.getAll(currentPage, currentPageSize, searchKey)

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
      } catch (error) {
        message.error(showError(error))
        setSearchKey('')
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [currentPage, currentPageSize, searchKey])

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
