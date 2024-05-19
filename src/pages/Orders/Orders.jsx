import { Link } from 'react-router-dom'
import Search from '../../components/Search'
import { useLoading } from '../../App'
import { useEffect, useState } from 'react'
import orderService from '../../services/orderService'
import notificationService from '../../services/notificationService'
import { formatDate, formatUSD } from '../../services/userService'

export default function Orders() {
  const { setIsLoading } = useLoading()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setIsLoading(true)
    orderService
      .getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => notificationService.Danger('Get failed orders'))
      .finally(() => setIsLoading(false))
  }, [setIsLoading])

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
            <div className="flex items-center space-x-2">
              <span className="hidden sm:block text-gray-500">Showing</span>
              <select
                id="countries"
                className="bg-gray-50 border cursor-pointer outline-none w-fit border-gray-300 text-gray-900 text-sm rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex flex-1 items-center space-x-2">
              <span className="hidden sm:block text-gray-500">entries</span>
              <Search />
            </div>
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Export all order
            </button>
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
        </div>
      </div>
    </>
  )
}
