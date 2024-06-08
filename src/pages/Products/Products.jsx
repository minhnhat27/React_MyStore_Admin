import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLoading } from '../../App'
import productService from '../../services/productService'
import { Button, Image, Input, Pagination, Switch, Table, message } from 'antd'
import { gender, toProductImageUrl } from '../../services/userService'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

export default function Products() {
  const { setIsLoading } = useLoading()
  const [products, setProducts] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  const [brandNames, setBrandNames] = useState([])
  const [categoryNames, setCategoryNames] = useState([])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (value) => <span className="font-semibold">#{value}</span>,
      sorter: (a, b) => a.id - b.id,
      width: 70,
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      render: (url) => (
        <Image
          width={80}
          height={80}
          className="object-contain"
          src={toProductImageUrl(url)}
          alt=""
        />
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filters: gender,
      onFilter: (value, record) => record.gender.indexOf(value) === 0,
    },
    {
      title: 'Brand',
      dataIndex: 'brandName',
      filters: brandNames,
      onFilter: (value, record) => record.brandName.indexOf(value) === 0,
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      filters: categoryNames,
      onFilter: (value, record) => record.categoryName.indexOf(value) === 0,
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      align: 'center',
      sorter: (a, b) => a.sold - b.sold,
    },
    {
      title: 'Enable',
      dataIndex: 'enable',
      align: 'center',
      filters: [
        { value: true, text: 'Enable' },
        { value: false, text: 'Not Enable' },
      ],
      onFilter: (value, record) => record.enable === value,
      render: (value, record) => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked={value}
          onChange={(e) => handleChangeEnable(e, record.id)}
          className="bg-gray-500"
        />
      ),
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <Link to={`product-detail/${record.id}`}>
          <Button>Detail</Button>
        </Link>
      ),
    },
  ]

  useEffect(() => {
    searchKey ? setSearchLoading(true) : setIsLoading(true)
    productService
      .getProducts(currentPage, currentPageSize, searchKey)
      .then((res) => {
        var newBrandNames = [...new Set(res.data?.items?.map((order) => order.brandName))].map(
          (value) => {
            return {
              value: value,
              text: value,
            }
          },
        )

        var newcategoryNames = [
          ...new Set(res.data?.items?.map((order) => order.categoryName)),
        ].map((value) => {
          return {
            value: value,
            text: value,
          }
        })

        setBrandNames(newBrandNames)
        setCategoryNames(newcategoryNames)

        setProducts(res.data?.items)
        setTotalItems(res.data?.totalItems)
      })
      .catch((err) => {
        message.error(err.message)
        setSearchKey('')
      })
      .finally(() => {
        setIsLoading(false)
        setSearchLoading(false)
      })
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

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

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
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            <Button size="large" type="primary">
              <Link to="add-product">+ Add new</Link>
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={products}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
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
