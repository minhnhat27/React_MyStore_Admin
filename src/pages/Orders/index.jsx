import { Link } from 'react-router-dom'
import Search from '../../components/Search'

export default function Orders() {
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
            <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
              <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr className="select-none">
                  <th scope="col" className="ps-2 py-2 w-2/5">
                    Product
                  </th>
                  <th scope="col" className="w-1/5 py-2">
                    Order ID
                  </th>
                  <th scope="col" className="w-1/5 py-2">
                    Total
                  </th>
                  <th scope="col" className="w-1/5 py-2 pe-2">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Link to="order-detail" className="hover:text-blue-500">
                      Apple MacBook Pro 17
                    </Link>
                  </th>
                  <td className="py-4">#12221</td>
                  <td className="py-4">$2999</td>
                  <td className="py-4 pe-2">Cancel</td>
                </tr>
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Link to="order-detail" className="hover:text-blue-500">
                      Microsoft Surface Pro
                    </Link>
                  </th>
                  <td className="py-4">White</td>
                  <td className="py-4">Laptop PC</td>
                  <td className="py-4 pe-2">$1999</td>
                </tr>
                <tr className="bg-white dark:bg-gray-700">
                  <th
                    scope="row"
                    className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Link to="order-detail" className="hover:text-blue-500">
                      Magic Mouse 2
                    </Link>
                  </th>
                  <td className="py-4">Black</td>
                  <td className="py-4">Accessories</td>
                  <td className="py-4 pe-2">$99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
