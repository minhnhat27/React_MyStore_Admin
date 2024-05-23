import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLoading } from '../../App'
import productService from '../../services/productService'
import { Button, Image, Input, Pagination, Switch, message } from 'antd'
import { toImageSrc } from '../../services/userService'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

export default function Products() {
  const { setIsLoading } = useLoading()
  const [products, setProducts] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  useEffect(() => {
    if (!searchKey) {
      setIsLoading(true)
      productService
        .getProducts(currentPage, currentPageSize)
        .then((res) => {
          setProducts(res.data?.items)
          setTotalItems(res.data?.totalItems)
        })
        .catch((err) => message.error(err.message))
        .finally(() => setIsLoading(false))
    } else {
      productService
        .getProducts(currentPage, currentPageSize, searchKey)
        .then((res) => {
          setProducts(res.data?.items)
          setTotalItems(res.data?.totalItems)
        })
        .catch((err) => message.error(err.message))
        .finally(() => setSearchLoading(false))
    }
  }, [setIsLoading, currentPage, currentPageSize, searchKey])

  const handleChangeEnable = (e, id) => {
    //setIsLoading(true)
    const data = {
      id: id,
      enable: e,
    }
    productService
      .updateProductEnable(data)
      .then(() => message.success('Success'))
      .catch((err) => message.error(err.message))
    //.finally(() => setIsLoading(false))
  }

  const handleSearch = (key) => {
    setSearchKey(key)
    if (!key) {
      setSearchLoading(true)
      productService
        .getProducts(currentPage, currentPageSize, key)
        .then((res) => {
          setProducts(res.data?.items)
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
            <Input.Search
              size="large"
              allowClear
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
            />
            <Button size="large" type="primary" className="bg-blue-500">
              <Link to="add-product">+ Add new</Link>
            </Button>
          </div>

          <div className="relative overflow-x-auto px-4">
            <table className="w-full text-center text-sm rtl:text-right text-gray-700 dark:text-gray-400">
              <thead className="text-sm whitespace-nowrap text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                        <Link to={`product-detail/${product.id}`} className="hover:text-blue-500">
                          #{product.id}
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
                        <Link to={`product-detail/${product.id}`} className="hover:text-blue-500">
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
