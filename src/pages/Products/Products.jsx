import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { App, Button, Flex, Image, Input, Pagination, Popconfirm, Switch, Table } from 'antd'
import { formatVND, gender, showError, toImageSrc, toTextValue } from '../../services/commonService'
import { CheckOutlined, CloseOutlined, DeleteOutlined, HomeFilled } from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import httpService from '../../services/http-service'
import { PRODUCT_API } from '../../services/const'

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
    filters: gender.map((item) => ({ value: item.value, text: item.label })),
    render: (value) => gender.find((e) => e.value === value)?.label,
    onFilter: (value, record) => record.gender === value,
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
  const { message, notification } = App.useApp()
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [brandNames, setBrandNames] = useState([])
  const [categoryNames, setCategoryNames] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        searchKey ? setSearchLoading(true) : setLoading(true)
        const params = { page, pageSize, key: searchKey }
        const data = await httpService.getWithParams(PRODUCT_API, params)
        var newBrandNames = toTextValue([...new Set(data?.items.map((order) => order.brandName))])
        var newcategoryNames = toTextValue([
          ...new Set(data?.items.map((order) => order.categoryName)),
        ])

        setBrandNames(newBrandNames)
        setCategoryNames(newcategoryNames)
        setProducts(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        setSearchKey('')
        notification.error({ message: 'Thất bại', description: showError(error) })
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, notification])

  const handleChangeEnable = async (id, value) => {
    // setIsLoading(true)
    try {
      const data = { enable: value }
      await httpService.put(PRODUCT_API + `/updateEnable/${id}`, data)
      message.success('Cập nhật thành công')
    } catch (error) {
      message.error(showError(error))
    }
    // finally {
    //   setIsLoading(false)
    // }
  }

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const handleDeleteProduct = async (id) => {
    try {
      await httpService.del(PRODUCT_API + `/${id}`)
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
            defaultPageSize={pageSize}
            defaultCurrent={page}
            showSizeChanger={true}
            onChange={(newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
          />
        </div>
      </div>
    </>
  )
}
