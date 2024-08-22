import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import productService from '../../services/products/productService'
import { Breadcrumb, Button, Flex, Image, Input, Pagination, Popconfirm, Switch, Table } from 'antd'
import { formatUSD, gender, showError, toImageSrc, toTextValue } from '../../services/commonService'
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAntdMessage } from '../../App'

const breadcrumbItems = [
  {
    title: 'Products',
  },
]

const columns = (handleChangeEnable, handleDeleteProduct, brandNames, categoryNames) => [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (value) => <span className="font-semibold">#{value}</span>,
  },
  {
    title: 'Image',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url) => (
      <Image
        width={80}
        height={80}
        className="object-contain"
        src={toImageSrc(url)}
        alt=""
        loading="lazy"
      />
    ),
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (value) => formatUSD.format(value),
    sorter: (a, b) => a.price - b.price,
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
        onChange={(value) => handleChangeEnable(record.id, value)}
        className="bg-gray-500"
      />
    ),
  },
  {
    title: 'Action',
    align: 'center',
    render: (_, record) => (
      <Flex className="space-x-2">
        <Link to={`product-detail/${record.id}`}>
          <Button>Detail</Button>
        </Link>
        <Popconfirm title="Are you sure delete?" onConfirm={() => handleDeleteProduct(record.id)}>
          <Button className="flex items-center">
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
      </Flex>
    ),
  },
]

export default function Products() {
  const { showMessage } = useAntdMessage()
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  const [brandNames, setBrandNames] = useState([])
  const [categoryNames, setCategoryNames] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        searchKey ? setSearchLoading(true) : setLoading(true)
        const res = await productService.getAll(currentPage, currentPageSize, searchKey)
        var newBrandNames = toTextValue([
          ...new Set(res.data?.items?.map((order) => order.brandName)),
        ])
        var newcategoryNames = toTextValue([
          ...new Set(res.data?.items?.map((order) => order.categoryName)),
        ])

        setBrandNames(newBrandNames)
        setCategoryNames(newcategoryNames)
        setProducts(res.data?.items)
        setTotalItems(res.data?.totalItems)
      } catch (error) {
        setSearchKey('')
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [currentPage, currentPageSize, searchKey])

  const handleChangeEnable = async (id, value) => {
    //setIsLoading(true)
    try {
      const data = { enable: value }
      await productService.updateEnable(id, data)
      showMessage.success('Successfully')
    } catch (error) {
      showMessage.error(showError(error))
    }
    //.finally(() => setIsLoading(false))
  }

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const handleDeleteProduct = async (id) => {
    try {
      await productService.remove(id)
      setProducts(products.filter((item) => item.id !== id))
      showMessage.success('Successfully')
    } catch (error) {
      showMessage.error(showError(error))
    }
  }

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
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
            <Link to="add-product">
              <Button size="large" type="primary">
                + Add new
              </Button>
            </Link>
          </div>

          <Table
            columns={columns(handleChangeEnable, handleDeleteProduct, brandNames, categoryNames)}
            dataSource={products}
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
