import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  App,
  Badge,
  Button,
  Divider,
  Image,
  Input,
  List,
  Modal,
  Pagination,
  Popconfirm,
  Rate,
  Select,
  Skeleton,
  Switch,
  Table,
  Tooltip,
} from 'antd'
import {
  formatDateTime,
  formatVND,
  showError,
  toImageSrc,
  toTextValue,
} from '../../services/commonService'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeTwoTone,
  HomeFilled,
  PlusOutlined,
} from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import httpService from '../../services/http-service'
import { AdminRole, PRODUCT_API } from '../../services/const'
import { useAuth } from '../../App'
import { FiRefreshCcw } from 'react-icons/fi'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Quản lý sản phẩm',
  },
]

const ReviewFilters = [
  { value: 0, label: 'Tất cả' },
  { value: 1, label: '1 Sao' },
  { value: 2, label: '2 Sao' },
  { value: 3, label: '3 Sao' },
  { value: 4, label: '4 Sao' },
  { value: 5, label: '5 Sao' },
  { value: 6, label: 'Có bình luận' },
  { value: 7, label: 'Có hình ảnh' },
]

const columns = (
  roles,
  handleChangeEnable,
  handleDeleteProduct,
  onOpenReview,
  brandNames,
  categoryNames,
) => [
  {
    title: 'ID',
    dataIndex: 'id',
    render: (value) => <span className="font-semibold">#{value}</span>,
    fixed: 'left',
  },
  {
    title: 'Ảnh đại diện',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url, record) =>
      record.discountPercent ? (
        <Badge.Ribbon className="text-xs" color="red" text={`-${record.discountPercent}%`}>
          <Image
            width={80}
            height={80}
            className="object-contain"
            src={toImageSrc(url)}
            alt="Ảnh sản phẩm"
          />
        </Badge.Ribbon>
      ) : (
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
    title: 'Tên sản phẩm',
    dataIndex: 'name',
    render: (value) => <div className="w-24 md:w-32 2xl:w-full line-clamp-2">{value}</div>,
    sorter: (a, b) => a.name.localeCompare(b.name),
    width: 100,
  },
  {
    title: 'Giá bán',
    dataIndex: 'price',
    render: (value, record) => (
      <span className="font-semibold">
        {formatVND.format(value - value * (record.discountPercent / 100.0))}
      </span>
    ),
    // sorter: (a, b) => a.price - b.price,
  },
  {
    title: (
      <>
        <Rate disabled value={1} count={1} /> Đánh giá
      </>
    ),
    dataIndex: 'rating',
    align: 'center',
    width: 50,
    render: (value, record) => (
      <>
        {record.ratingCount > 0 ? (
          <>
            <div className="flex items-center justify-center gap-2">
              {value}
              <Button onClick={() => onOpenReview(record.id)} type="text" className="px-2">
                <EyeTwoTone className="text-lg" />
              </Button>
            </div>
            <div className="text-xs">{record.ratingCount} lượt đánh giá</div>
          </>
        ) : (
          <div className="text-xs">Chưa có đánh giá</div>
        )}
      </>
    ),
  },
  // {
  //   title: 'Giới tính',
  //   dataIndex: 'gender',
  //   align: 'center',
  //   filters: gender.map((item) => ({ value: item.value, text: item.label })),
  //   render: (value) => gender.find((e) => e.value === value)?.label,
  //   onFilter: (value, record) => record.gender === value,
  // },
  {
    title: 'Thương hiệu',
    dataIndex: 'brandName',
    align: 'center',
    filters: brandNames,
    onFilter: (value, record) => record.brandName.indexOf(value) === 0,
  },
  {
    title: 'Danh mục',
    dataIndex: 'categoryName',
    align: 'center',
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
        value={value}
        onChange={(value) => handleChangeEnable(record.id, value)}
        className="bg-gray-500"
      />
    ),
  },
  {
    title: 'Hành động',
    align: 'center',
    render: (_, record) => (
      <div>
        <Tooltip title="Xem chi tiết">
          <Link to={`product-detail/${record.id}`}>
            <Button className="m-1">
              <EyeTwoTone />
            </Button>
          </Link>
        </Tooltip>
        {roles?.includes(AdminRole) && (
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDeleteProduct(record.id)}>
            <Button className="m-1">
              <DeleteOutlined className="text-red-500" />
            </Button>
          </Popconfirm>
        )}
      </div>
    ),
  },
]

export default function Products() {
  const { state } = useAuth()
  const { message } = App.useApp()
  const [products, setProducts] = useState([])

  const [reviewLoading, setReviewLoading] = useState(false)
  const [openReview, setOpenReview] = useState(false)
  const [reviews, setReviews] = useState([])
  const [listreviews, setListreviews] = useState([])
  const [reviewPage, setReviewPage] = useState(1)
  const [totalreview, setTotalreview] = useState(0)
  const [reviewFilter, setReviewFilter] = useState(0)

  const [productId, setProductId] = useState()

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
        message.error(showError(error))
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, message])

  const handleChangeEnable = async (id, value) => {
    try {
      const data = { enable: value }
      const result = await httpService.put(PRODUCT_API + `/updateEnable/${id}`, data)
      setProducts((pre) => pre.map((item) => (item.id === id ? { ...item, enable: result } : item)))
      message.success('Cập nhật thành công')
    } catch (error) {
      message.error(showError(error))
    }
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

  const onOpenReview = async (newId) => {
    try {
      setOpenReview(true)
      if (newId !== productId) {
        setProductId(newId)
        setReviewLoading(true)
        setReviewPage(1)
        setReviewFilter(0)
        const params = { page: 1 }
        const data = await httpService.getWithParams(PRODUCT_API + `/${newId}/reviews`, params)
        setReviews(data.items)
        setListreviews(data.items)
        setTotalreview(data.totalItems)
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setReviewLoading(false)
    }
  }

  const onLoadMore = async () => {
    try {
      if (productId) {
        setReviews(
          listreviews.concat(
            [...new Array(3)].map(() => ({
              id: '',
              description: '',
              star: 0,
              username: '',
              variant: '',
              imagesUrls: [],
              createdAt: '',
            })),
          ),
        )
        const newPage = reviewPage + 1
        setReviewPage(newPage)
        const params = { page: newPage }
        const data = await httpService.getWithParams(PRODUCT_API + `/${productId}/reviews`, params)
        const newData = reviews.concat(data.items)
        setReviews(newData)
        setListreviews(newData)
      }
    } catch (error) {
      message.error(showError(error))
    }
  }

  const loadMore =
    reviews.length < totalreview ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        <Button type="primary" className="rounded-sm" onClick={onLoadMore}>
          Xem đánh giá cũ hơn
        </Button>
      </div>
    ) : null

  const handleDeletereview = async (id) => {
    try {
      const rv = reviews.find((e) => e.id === id)
      await httpService.del(`${PRODUCT_API}/reviews/${id}`)
      const newList = reviews.filter((item) => item.id !== id)
      setReviews(newList)
      setListreviews(newList)
      setTotalreview((pre) => pre - 1)

      setProducts((pre) =>
        pre.map((item) => {
          if (item.id === productId) {
            const currentStar = item.rating * item.ratingCount
            const rating = ((currentStar - rv.star) / (item.ratingCount - 1)).toFixed(1)
            const ratingCount = item.ratingCount - 1
            return { ...item, rating, ratingCount }
          }
          return item
        }),
      )
    } catch (error) {
      message.error(showError(error))
    }
  }

  const onClosereview = () => setOpenReview(false)

  const handleChangeReviewFilter = async (value) => {
    try {
      if (value !== reviewFilter && productId) {
        setReviewFilter(value)
        setReviewLoading(true)
        setReviewPage(1)
        const params = { page: 1, rate: value }
        const data = await httpService.getWithParams(PRODUCT_API + `/${productId}/reviews`, params)
        setReviews(data.items)
        setListreviews(data.items)
        setTotalreview(data.totalItems)
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setReviewLoading(false)
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
              placeholder="ID, tên, thương hiệu,..."
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            {state?.roles.includes(AdminRole) && (
              <Tooltip title="Xử lý ảnh lại">
                <Button
                  onClick={() => {
                    httpService.get(PRODUCT_API + '/retrain')
                    message.success('Đã gửi yêu cầu xử lý ảnh lại')
                  }}
                  size="large"
                  type="primary"
                >
                  <FiRefreshCcw />
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Thêm sản phẩm">
              <Link to="add-product">
                <Button size="large" type="primary">
                  <PlusOutlined />
                </Button>
              </Link>
            </Tooltip>
          </div>

          <Table
            columns={columns(
              state.roles,
              handleChangeEnable,
              handleDeleteProduct,
              onOpenReview,
              brandNames,
              categoryNames,
            )}
            dataSource={products}
            rowKey={(record) => record.id}
            className="overflow-x-auto overflow-y-hidden"
            rowHoverable
            pagination={false}
            loading={loading}
          />

          <Pagination
            className="py-4"
            align="center"
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
      <Modal
        open={openReview}
        centered
        width={640}
        title={
          <>
            Lượt đánh giá sản phẩm
            <Select
              value={reviewFilter}
              onChange={(value) => handleChangeReviewFilter(value)}
              options={ReviewFilters}
              className="w-32 m-1"
            />
          </>
        }
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        onOk={onClosereview}
        onCancel={onClosereview}
        okText="Đóng"
        okButtonProps={{ danger: true }}
        footer={(_, { OkBtn }) => (
          <>
            <OkBtn />
          </>
        )}
      >
        <List
          loading={reviewLoading}
          itemLayout="horizontal"
          dataSource={reviews}
          loadMore={loadMore}
          renderItem={(item, i) => (
            <List.Item
              key={i}
              actions={[
                <Popconfirm
                  onConfirm={() => handleDeletereview(item.id)}
                  title="Xác nhận xóa đánh giá này"
                >
                  <Button>
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Skeleton avatar title={false} loading={!item.id} active>
                <List.Item.Meta
                  // avatar={<Avatar src={item.picture.large} />}
                  title={
                    <>
                      <div className="font-semibold">{item.username}</div>
                      <div>{item.description}</div>
                      <div className="mt-2 flex items-center flex-wrap">
                        <Rate disabled value={item.star} />
                        <Divider type="vertical" />
                        {formatDateTime(item.createdAt)}
                        <Divider type="vertical" />
                        <div>{item.variant}</div>
                      </div>
                    </>
                  }
                  description={item.imagesUrls?.map((url, i) => (
                    <Image
                      rootClassName="m-1"
                      key={i}
                      src={toImageSrc(url)}
                      height={90}
                      width={90}
                      className="object-contain"
                    />
                  ))}
                />
                {/* <div className="px-1">{item.variant}</div> */}
              </Skeleton>
            </List.Item>
          )}
        />
      </Modal>
    </>
  )
}
