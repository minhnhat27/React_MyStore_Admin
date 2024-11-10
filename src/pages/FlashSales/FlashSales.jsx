import { DeleteOutlined, EditTwoTone, HomeFilled, PlusOutlined } from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import {
  App,
  Badge,
  Button,
  DatePicker,
  Drawer,
  Form,
  Image,
  InputNumber,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tooltip,
} from 'antd'
import { useEffect, useState } from 'react'
import httpService from '../../services/http-service'
import { FLASHSALES_API, PRODUCT_API } from '../../services/const'
import { formatDate, formatVND, showError, toImageSrc } from '../../services/commonService'
import dayjs from 'dayjs'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Chiến dịch giảm giá',
  },
]

const disabledDate = (current) => current && current < dayjs().add(-1, 'd').endOf('day')

const timeFrames = [
  {
    value: 0,
    label: '00:00:00 - 01:59:59',
  },
  {
    value: 1,
    label: '10:00:00 - 11:59:59',
  },
  {
    value: 2,
    label: '19:00:00 - 21:59:59',
  },
]

const flashSaleColumns = (handleDeleteFlashSale, onOpenUpdateFlashSale) => [
  {
    title: 'Mã chiến dịch',
    dataIndex: 'id',
    width: 150,
  },
  {
    title: 'Ngày',
    dataIndex: 'date',
    render: (value) => formatDate(value),
  },
  {
    title: 'Khung giờ',
    dataIndex: 'discountTimeFrame',
    render: (value) => timeFrames.find((e) => e.value === value)?.label,
  },
  {
    title: 'Số lượng',
    dataIndex: 'productQuantity',
    align: 'center',
    render: (value) => <div>{value} sản phẩm</div>,
  },
  {
    title: 'Đã bán',
    dataIndex: 'totalSold',
    align: 'center',
  },
  {
    title: 'Tổng doanh thu',
    dataIndex: 'totalRevenue',
    align: 'center',
    render: (value) => formatVND.format(value),
  },
  {
    title: 'Hành động',
    dataIndex: 'id',
    align: 'center',
    render: (value) => (
      <>
        <Tooltip title="Chỉnh sửa">
          <Button onClick={() => onOpenUpdateFlashSale(value)} className="m-1">
            <EditTwoTone />
          </Button>
        </Tooltip>
        <Popconfirm title="Xác nhận xóa chiến dịch" onConfirm={() => handleDeleteFlashSale(value)}>
          <Button className="m-1">
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
      </>
    ),
  },
]

const productColumns = [
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url, record) =>
      record.discountPercent ? (
        <Badge.Ribbon className="text-xs" color="red" text={`-${record.discountPercent}%`}>
          <Image
            rootClassName="shrink-0"
            width={60}
            height={80}
            className="object-cover shrink-0"
            src={toImageSrc(url)}
            alt="Ảnh sản phẩm"
          />
        </Badge.Ribbon>
      ) : (
        <Image
          rootClassName="shrink-0"
          width={60}
          height={80}
          className="object-cover shrink-0"
          src={toImageSrc(url)}
          alt="Ảnh sản phẩm"
        />
      ),
  },
  {
    title: 'Tên sản phẩm',
    dataIndex: 'name',
    render: (value) => <div className="w-24 md:w-32 2xl:w-full line-clamp-2">{value}</div>,
  },
  {
    title: 'Giá',
    dataIndex: 'price',
    render: (value) => formatVND.format(value),
  },
  {
    title: 'Lượt bán',
    align: 'center',
    dataIndex: 'sold',
  },
  {
    align: 'center',
    dataIndex: 'enable',
    className: 'max-w-24',
    render: (value) => !value && <div className="text-red-500 font-semibold">Sản phẩm bị ẩn</div>,
  },
]

export default function FlashSales() {
  const [form] = Form.useForm()
  const [formUpdate] = Form.useForm()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [flashSales, setFlashSales] = useState([])

  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const [productPage, setProductPage] = useState(1)
  const [productPageSize, setProductPageSize] = useState(10)
  const [productTotalItems, setProductTotalItems] = useState(0)

  const [products, setProducts] = useState([])
  const [productLoading, setProductLoading] = useState(false)
  const [openProductList, setOpenProductList] = useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  const [listProductFlashSale, setListProductFlashSale] = useState([])
  const [updateId, setUpdateId] = useState()

  const [productsInFlashSale, setProductsInFlashSale] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = { page, pageSize }
        const data = await httpService.getWithParams(FLASHSALES_API, params)
        setFlashSales(data.items)
        setTotalItems(data.totalItems)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message, page, pageSize])

  const handleGetProducts = async (p, pS) => {
    try {
      if (!products.length || p !== productPage || pS !== productPageSize) {
        setProductPage(p)
        setProductPageSize(pS)
        setProductLoading(true)

        const params = { page: p, pageSize: pS }
        const data = await httpService.getWithParams(PRODUCT_API, params)
        setProducts(data.items)
        setProductTotalItems(data.totalItems)
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setProductLoading(false)
    }
  }

  const onOpenProductList = async () => {
    setOpenProductList(true)
    await handleGetProducts(productPage, productPageSize)
  }

  const onCloseCreateFlashSale = () => {
    setOpenCreate(false)
    setSelectedProducts([])
    setSelectedRowKeys([])
    setListProductFlashSale([])
  }

  const onCreate = async (values) => {
    try {
      if (!selectedProducts.length) throw new Error('Vui lòng chọn sản phẩm')

      if (listProductFlashSale.some((e) => !e.productId || !e.discountPercent))
        throw new Error('Vui lòng nhập giảm giá cho từng sản phẩm')

      setCreateLoading(true)
      const data = {
        ...values,
        date: values.date.format(),
        productFlashSales: listProductFlashSale,
      }
      const res = await httpService.post(FLASHSALES_API, data)
      setFlashSales((pre) => [...pre, res])
      setTotalItems((pre) => pre + 1)
      onCloseCreateFlashSale()
    } catch (error) {
      message.error(showError(error))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteFlashSale = async (id) => {
    try {
      await httpService.del(`${FLASHSALES_API}/${id}`)
      setFlashSales((pre) => pre.filter((e) => e.id !== id))
      setTotalItems((pre) => pre - 1)
    } catch (error) {
      message.error(showError(error))
    }
  }

  useEffect(() => {
    setListProductFlashSale((pre) => pre.filter((e) => selectedProducts.includes(e.productId)))
  }, [selectedProducts])

  const onCloseProduct = () => {
    setOpenProductList(false)
    if (selectedProducts !== selectedRowKeys) setSelectedRowKeys(selectedProducts)
  }

  const handleConfirmProduct = () => {
    setSelectedProducts(selectedRowKeys)
    setOpenProductList(false)
  }

  const onChangeProductInFlashSale = (id, discountPercent) => {
    setListProductFlashSale((pre) => {
      if (!pre.some((e) => e.productId === id)) {
        return [...pre, { productId: id, discountPercent }]
      }
      return pre.map((item) => {
        if (item.productId === id) {
          return { ...item, discountPercent }
        }
        return item
      })
    })
  }

  const onOpenUpdateFlashSale = async (id) => {
    try {
      setOpenUpdate(true)
      setUpdateId(id)
      const flashSale = flashSales.find((e) => e.id === id)
      formUpdate.setFieldsValue({
        date: dayjs(flashSale.date),
        discountTimeFrame: flashSale.discountTimeFrame,
      })
      setProductLoading(true)
      const res = await httpService.get(`${FLASHSALES_API}/products/${id}`)
      setProductsInFlashSale(res)
    } catch (error) {
      message.error(showError(error))
    } finally {
      setProductLoading(false)
    }
  }

  const onUpdate = async (values) => {
    try {
      if (updateId) {
        setCreateLoading(true)
        const data = {
          ...values,
          date: values.date.format(),
          productFlashSales: listProductFlashSale,
        }
        const res = await httpService.put(`${FLASHSALES_API}/${updateId}`, data)
        setFlashSales((pre) =>
          pre.map((item) =>
            item.id === updateId
              ? { ...item, date: res.date, discountTimeFrame: res.discountTimeFrame }
              : item,
          ),
        )
        setOpenUpdate(false)
        setUpdateId(undefined)
        setListProductFlashSale([])
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setCreateLoading(false)
    }
  }

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys)
    },
    getCheckboxProps: (record) => ({
      disabled: !record.enable,
    }),
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink className="py-2" breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex flex-col md:flex-row md:justify-between py-4">
            <Form.Item layout="horizontal" label="Lưu ý" required>
              <div>- Giảm giá chiến dịch sẽ không được cộng dồn với mức giảm giá gốc.</div>
              <div>
                - Giảm giá của chiến dịch sẽ được ưu tiên. Đặt mức giảm giá chiến dịch lớn hơn mức
                giảm giá gốc để đạt được kết quả tốt nhất.
              </div>
            </Form.Item>
            <Button
              className="ml-2"
              onClick={() => setOpenCreate(true)}
              type="primary"
              size="large"
            >
              <PlusOutlined /> Tạo chiến dịch
            </Button>
          </div>

          <Table
            columns={flashSaleColumns(handleDeleteFlashSale, onOpenUpdateFlashSale)}
            dataSource={flashSales}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
            loading={loading}
          />

          <Pagination
            hideOnSinglePage
            className="py-4"
            align="center"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} chiến dịch`}
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
        open={openCreate}
        cancelText="Đóng"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        title="Tạo chiến dịch mới"
        confirmLoading={createLoading}
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={onCloseCreateFlashSale}
        centered
        destroyOnClose
        maskClosable={false}
        modalRender={(dom) => (
          <Form layout="vertical" form={form} clearOnDestroy name="flashSales" onFinish={onCreate}>
            {dom}
          </Form>
        )}
      >
        <div className="grid grid-cols-2 gap-2 bg-white">
          <Form.Item
            name="date"
            label="Chọn ngày"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              disabledDate={disabledDate}
              showNow={false}
              className="w-full"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="discountTimeFrame"
            label="Khung giờ giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
          >
            <Select placeholder="Chọn khung giờ" size="large" options={timeFrames} />
          </Form.Item>
        </div>
        <div>
          <div>Thêm sản phẩm cho chiến dịch</div>
          <div className="text-center my-1">
            <Button onClick={onOpenProductList} size="large" className="my-2">
              <PlusOutlined />
              Chọn sản phẩm
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {selectedProducts.map((id) => {
              const product = products.find((e) => e.id === id)
              return (
                <div key={id} className="flex items-center gap-2">
                  {product.discountPercent ? (
                    <Badge.Ribbon
                      color="red"
                      className="text-xs"
                      text={`-${product.discountPercent}%`}
                    >
                      <Image
                        rootClassName="shrink-0"
                        width={80}
                        height={100}
                        src={toImageSrc(product?.imageUrl)}
                        className="object-cover shrink-0"
                      />
                    </Badge.Ribbon>
                  ) : (
                    <Image
                      rootClassName="shrink-0"
                      width={80}
                      height={100}
                      src={toImageSrc(product?.imageUrl)}
                      className="object-cover shrink-0"
                    />
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="max-w-96 line-clamp-1">{product?.name}</div>
                    <div>{formatVND.format(product?.price)}</div>
                    <div className="text-xs">Giảm giá (%)</div>
                    <InputNumber
                      onChange={(value) => onChangeProductInFlashSale(id, value)}
                      placeholder="10%"
                      min={1}
                      max={90}
                      required
                      className="w-full h-fit"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Drawer
          width={640}
          styles={{ body: { padding: '0 1rem' } }}
          open={openProductList}
          onClose={onCloseProduct}
          title="Chọn sản phẩm"
          footer={
            <div className="flex justify-end">
              <Button onClick={handleConfirmProduct} type="primary">
                Xác nhận
              </Button>
            </div>
          }
        >
          <Table
            rowSelection={{
              selectedRowKeys,
              hideSelectAll: true,
              ...rowSelection,
            }}
            columns={productColumns}
            dataSource={products}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
            loading={productLoading}
          />
          <Pagination
            hideOnSinglePage
            className="py-4"
            align="center"
            total={productTotalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
            defaultPageSize={productPageSize}
            defaultCurrent={productPage}
            showSizeChanger={true}
            onChange={handleGetProducts}
          />
        </Drawer>
      </Modal>

      <Modal
        open={openUpdate}
        cancelText="Đóng"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 } }}
        title="Chỉnh sửa chiến dịch"
        confirmLoading={createLoading}
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setOpenUpdate(false)}
        centered
        destroyOnClose
        maskClosable={false}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={formUpdate}
            clearOnDestroy
            name="updateFlashSales"
            onFinish={onUpdate}
          >
            {dom}
          </Form>
        )}
      >
        <div className="grid grid-cols-2 gap-2 bg-white">
          <Form.Item
            name="date"
            label="Chọn ngày"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              disabledDate={disabledDate}
              showNow={false}
              className="w-full"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="discountTimeFrame"
            label="Khung giờ giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
          >
            <Select placeholder="Chọn khung giờ" size="large" options={timeFrames} />
          </Form.Item>
        </div>
        <div>
          <div>Sản phẩm trong chiến dịch</div>
          <div className="py-2 space-y-2">
            {productLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              productsInFlashSale.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.discountPercent ? (
                    <Badge.Ribbon
                      color="red"
                      className="text-xs"
                      text={`-${item.discountPercent}%`}
                    >
                      <Image
                        rootClassName="shrink-0"
                        width={80}
                        height={100}
                        src={toImageSrc(item.imageUrl)}
                        className="object-cover shrink-0"
                      />
                    </Badge.Ribbon>
                  ) : (
                    <Image
                      rootClassName="shrink-0"
                      width={80}
                      height={100}
                      src={toImageSrc(item.imageUrl)}
                      className="object-cover shrink-0"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="max-w-96 line-clamp-2">{item.name}</div>
                    <div className="text-xs">Giảm giá (%)</div>
                    <InputNumber
                      onChange={(value) => onChangeProductInFlashSale(item.id, value)}
                      placeholder="10%"
                      defaultValue={item.flashSaleDiscountPercent}
                      min={1}
                      max={90}
                      required
                      className="h-fit"
                    />
                  </div>
                  <div className="text-end">
                    <div>Giá gốc</div>
                    <div>{formatVND.format(item.price)}</div>
                  </div>
                </div>
              ))
            )}
            {productsInFlashSale.length <
              flashSales.find((e) => e.id === updateId)?.productQuantity && (
              <>
                <span>* </span>
                {flashSales.find((e) => e.id === updateId)?.productQuantity -
                  productsInFlashSale.length}
                <span> sản phẩm đã bị ẩn</span>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
