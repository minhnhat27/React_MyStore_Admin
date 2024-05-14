import { Link } from 'react-router-dom'
import Search from '../../components/Search'
import { useEffect, useState } from 'react'
import { useLoading } from '../../App'
import productService from '../../services/productService'
import notificationService from '../../services/notificationService'
import { Image, Switch } from 'antd'
import { toImageSrc } from '../../services/userService'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

export default function Products() {
  const { setIsLoading } = useLoading()
  const [products, setProducts] = useState([])

  useEffect(() => {
    setIsLoading(true)
    productService
      .getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => notificationService.Danger('Get failed products'))
      .finally(() => setIsLoading(false))
  }, [setIsLoading])

  const handleChangeEnable = (e, id) => {
    setIsLoading(true)
    const data = {
      id: id,
      enable: e,
    }
    productService
      .updateProductEnable(data)
      .then(() => notificationService.Success('Update successfull product'))
      .catch(() => notificationService.Danger('Update failed product'))
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Product List</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Products List</span>
          </div>
        </div>
        <div className="py-2 px-4 bg-white rounded-lg drop-shadow">
          <span className="text-gray-600 text-sm">
            Tip search by Product ID: Each product is provided with a unique ID, which you can rely
            on to find the exact product you need.
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
            <div>
              <Link
                to="add-product"
                type="button"
                className="text-white py-2 px-4 bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                + Add new
              </Link>
            </div>
          </div>

          <div className="relative overflow-x-auto px-4">
            <table className="w-full text-center text-sm rtl:text-right text-gray-700 dark:text-gray-400">
              <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr className="select-none">
                  <th scope="col" className="p-2">
                    ID
                  </th>
                  <th scope="col" className="p-2">
                    Image
                  </th>
                  <th scope="col" className="p-2">
                    Product Name
                  </th>
                  <th scope="col" className="p-2">
                    Gender
                  </th>
                  <th scope="col" className="p-2">
                    Brand
                  </th>
                  <th scope="col" className="p-2">
                    Category
                  </th>
                  <th scope="col" className="p-2">
                    Sold
                  </th>
                  <th scope="col" className="p-2">
                    Enable
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => {
                  return (
                    <tr key={i} className="bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <Link
                          to={`product-detail?id=${product.id}`}
                          className="hover:text-blue-500"
                        >
                          {product.id}
                        </Link>
                      </th>
                      <td className="py-2">
                        <Image
                          width={100}
                          height={100}
                          className="object-contain"
                          src={toImageSrc(product.base64String)}
                          alt=""
                        />
                      </td>
                      <td className="py-2">
                        <Link
                          to={`product-detail?id=${product.id}`}
                          className="hover:text-blue-500"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="py-2">{product.gender}</td>
                      <td className="py-2">{product.brandName}</td>
                      <td className="py-2">{product.categoryName}</td>
                      <td className="py-2">{product.sold}</td>
                      <td className="py-2">
                        <Switch
                          checkedChildren={<CheckOutlined />}
                          unCheckedChildren={<CloseOutlined />}
                          defaultChecked={product.enable}
                          onChange={(e) => handleChangeEnable(e, product.id)}
                          className="bg-gray-500"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
