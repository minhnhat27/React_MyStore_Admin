import { Link } from 'react-router-dom'
import { useLoading } from '../../App'
import { useEffect, useState } from 'react'
import orderService from '../../services/orderService'
import { formatDate, formatUSD } from '../../services/userService'
import { Button, Input, Pagination, message } from 'antd'

export default function Orders() {
  const { setIsLoading } = useLoading()
  const [orders, setOrders] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  useEffect(() => {
    if (!searchKey) {
      setIsLoading(true)
      orderService
        .getOrders(currentPage, currentPageSize)
        .then((res) => {
          setOrders(res.data?.items)
          setTotalItems(res.data?.totalItems)
        })
        .catch((err) => message.error(err.message))
        .finally(() => setIsLoading(false))
    } else {
      orderService
        .getOrders(currentPage, currentPageSize, searchKey)
        .then((res) => {
          setOrders(res.data?.items)
          setTotalItems(res.data?.totalItems)
        })
        .catch((err) => message.error(err.message))
        .finally(() => setSearchLoading(false))
    }
  }, [setIsLoading, currentPage, currentPageSize, searchKey])

  const handleSearch = (key) => {
    setSearchKey(key)
    if (!key) {
      setSearchLoading(true)
      orderService
        .getOrders(currentPage, currentPageSize, key)
        .then((res) => {
          setOrders(res.data?.items)
          setTotalItems(res.data?.totalItems)
        })
        .catch((err) => message.error(err.message))
        .finally(() => setSearchLoading(false))
    }
  }

  return (
    <>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Order List</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Order List</span>
          </div>
        </div>
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
            />
            <Button size="large" type="primary" className="bg-blue-500">
              Export all order
            </Button>
          </div>

          <div className="relative overflow-x-auto px-4">
            <table className="w-full text-center text-sm rtl:text-right text-gray-700 dark:text-gray-400">
              <thead className="text-sm whitespace-nowrap text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr className="select-none">
                  <th scope="col" className="p-2 text-left">
                    Order ID
                  </th>
                  <th scope="col" className="p-2">
                    Total
                  </th>
                  <th scope="col" className="p-2">
                    Paid
                  </th>
                  <th scope="col" className="p-2">
                    Payment Method
                  </th>
                  <th scope="col" className="p-2">
                    Order Date
                  </th>
                  <th scope="col" className="p-2">
                    Order Status
                  </th>
                  <th scope="col" className="p-2">
                    User Id
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={i} className="bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                    <th
                      scope="row"
                      className="text-left py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <Link to="order-detail" className="hover:text-blue-500">
                        #{order.id}
                      </Link>
                    </th>
                    <td className="py-4">{formatUSD.format(order.total)}</td>
                    <td className="py-4 px-2">
                      {order.paid ? 'Paid' : <span className="text-red-500 font-bold">Unpaid</span>}
                    </td>
                    <td className="py-4">{order.paymentMethod}</td>
                    <td className="py-4 px-2 whitespace-nowrap">{formatDate(order.orderDate)}</td>
                    <td className="py-4">{order.orderStatus}</td>
                    <td className="py-4">#{order.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            className="text-center"
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
