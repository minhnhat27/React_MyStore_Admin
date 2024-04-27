export default function OrderDetail() {
  return (
    <>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Order #12221</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Order List</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Order Detail</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Order #12221</span>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="grid gap-4 grid-cols-1">
            <div className="py-2 px-4 bg-white rounded-lg drop-shadow">
              <div className="relative overflow-x-auto px-4">
                <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
                  <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="select-none">
                      <th scope="col" className="ps-2 py-2 w-1/2">
                        Product name
                      </th>
                      <th scope="col" className="w-1/4 py-2">
                        Quantity
                      </th>
                      <th scope="col" className="w-1/4 py-2 pe-2">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            width={50}
                            height={50}
                            src="https://st.depositphotos.com/2001755/3622/i/450/depositphotos_36220949-stock-photo-beautiful-landscape.jpg"
                            alt=""
                          />
                          <span className="whitespace-pre-wrap">Apple MacBook Pro 17</span>
                        </div>
                      </th>
                      <td className="py-4">#12221</td>
                      <td className="py-4">$2999</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            width={50}
                            height={50}
                            src="https://st.depositphotos.com/2001755/3622/i/450/depositphotos_36220949-stock-photo-beautiful-landscape.jpg"
                            alt=""
                          />
                          <span className="whitespace-pre-wrap">Microsoft Surface Pro</span>
                        </div>
                      </th>
                      <td className="py-4">White</td>
                      <td className="py-4">Laptop PC</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            width={50}
                            height={50}
                            src="https://st.depositphotos.com/2001755/3622/i/450/depositphotos_36220949-stock-photo-beautiful-landscape.jpg"
                            alt=""
                          />
                          <span className="whitespace-pre-wrap">Magic Mouse 2</span>
                        </div>
                      </th>
                      <td className="py-4">Black</td>
                      <td className="py-4">Accessories</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="py-2 px-4 bg-white rounded-lg drop-shadow">
              <div className="relative overflow-x-auto px-4">
                <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
                  <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr className="select-none">
                      <th scope="col" className="ps-2 py-2 w-2/5">
                        Cart Totals
                      </th>
                      <th scope="col" className="w-1/5 py-2 pe-2">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        Subtotal:
                      </th>
                      <td className="py-4 pe-2">$70</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        Shipping:
                      </th>
                      <td className="py-4 pe-2">$10</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        Tax:
                      </th>
                      <td className="py-4 pe-2">$10</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-700">
                      <th
                        scope="row"
                        className="ps-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        Total price:
                      </th>
                      <td className="py-4 pe-2 text-red-500 font-bold">$90</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 h-fit">
            <div className="py-2 px-4 bg-white rounded-lg drop-shadow">
              <span className="font-bold">Summary</span>
              <div className="relative">
                <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-400">
                  <tbody>
                    <tr className="bg-white dark:bg-gray-800 dark:border-gray-700">
                      <td className="ps-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Order ID
                      </td>
                      <td className="py-2 pe-2 font-medium text-black">#12221</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-800 dark:border-gray-700">
                      <td className="ps-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Date
                      </td>
                      <td className="py-2 pe-2 font-medium text-black">20 Nov 2023</td>
                    </tr>
                    <tr className="bg-white dark:bg-gray-700">
                      <td className="ps-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        Total
                      </td>
                      <td className="py-2 pe-2 font-medium text-red-500">$90</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg drop-shadow">
              <span className="font-bold">Shipping Address</span>
              <div className=" text-gray-700 py-2 text-sm">
                3517 W. Gray St. Utica, Pennsylvania 57867
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg drop-shadow">
              <span className="font-bold">Payment Method</span>
              <div className=" text-gray-700 py-2 text-sm">
                Pay on Delivery (Cash/Card). Cash on delivery (COD) available. Card/Net banking
                acceptance subject to device availability.
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg drop-shadow space-y-2">
              <span className="font-bold">Expected Date Of Delivery</span>
              <div className="text-green-500 ">20 Nov 2023</div>
              <button
                type="button"
                className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Track order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
