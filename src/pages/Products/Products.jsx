import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import productService from '../../services/products/productService'
import { App, Button, Flex, Image, Input, Pagination, Popconfirm, Switch, Table } from 'antd'
import { formatVND, gender, showError, toImageSrc, toTextValue } from '../../services/commonService'
import { CheckOutlined, CloseOutlined, DeleteOutlined, HomeFilled } from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Sản phẩm',
  },
]

const columns = (handleChangeEnable, handleDeleteProduct, brandNames, categoryNames) => [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (value) => <span className="font-semibold">#{value}</span>,
  },
  {
    title: 'Ảnh đại diện',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url) => (
      <Image
        width={80}
        height={80}
        className="object-contain"
        src={toImageSrc(url)}
        alt="Ảnh sản phẩm"
      />
    ),
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    render: (value) => <div className="w-24 md:w-32 2xl:w-full truncate">{value}</div>,
    sorter: (a, b) => a.name.localeCompare(b.name),
    width: 100,
  },
  {
    title: 'Giá',
    dataIndex: 'price',
    render: (value) => formatVND.format(value),
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: 'Giới tính',
    dataIndex: 'gender',
    filters: gender,
    onFilter: (value, record) => record.gender.indexOf(value) === 0,
  },
  {
    title: 'Thương hiệu',
    dataIndex: 'brandName',
    filters: brandNames,
    onFilter: (value, record) => record.brandName.indexOf(value) === 0,
  },
  {
    title: 'Danh mục',
    dataIndex: 'categoryName',
    filters: categoryNames,
    onFilter: (value, record) => record.categoryName.indexOf(value) === 0,
  },
  {
    title: 'Đã bán',
    dataIndex: 'sold',
    align: 'center',
    sorter: (a, b) => a.sold - b.sold,
  },
  {
    title: 'Kích hoạt',
    dataIndex: 'enable',
    align: 'center',
    filters: [
      { value: true, text: 'Kích hoạt' },
      { value: false, text: 'Chưa kích hoạt' },
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
    title: 'Hành động',
    align: 'center',
    render: (_, record) => (
      <Flex className="space-x-2">
        <Link to={`product-detail/${record.id}`}>
          <Button>Detail</Button>
        </Link>
        <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDeleteProduct(record.id)}>
          <Button className="flex items-center">
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
      </Flex>
    ),
  },
]

export default function Products() {
  const { message } = App.useApp()
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
      message.success('Cập nhật thành công')
    } catch (error) {
      message.error(showError(error))
    }
    //.finally(() => setIsLoading(false))
  }

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const handleDeleteProduct = async (id) => {
    try {
      await productService.remove(id)
      setProducts(products.filter((item) => item.id !== id))
      message.success('Thành công')
    } catch (error) {
      message.error(showError(error))
    }
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex space-x-2 py-4">
            <Input.Search
              size="large"
              allowClear
              placeholder="ID, tên, giá,..."
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            <Link to="add-product">
              <Button size="large" type="primary">
                + Thêm sản phẩm
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
            hideOnSinglePage
            className="py-4"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
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
