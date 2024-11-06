import { HomeFilled, PlusOutlined } from '@ant-design/icons'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import {
  App,
  Badge,
  Button,
  DatePicker,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Table,
} from 'antd'
import { useEffect, useState } from 'react'
import httpService from '../../services/http-service'
import { PRODUCT_API } from '../../services/const'
import { showError, toImageSrc } from '../../services/commonService'
// import { Select, Table } from 'antd'
// import { useState } from 'react'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Chiến dịch',
  },
]

const columns = [
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url, record) =>
      record.discountPercent ? (
        <Badge.Ribbon className="text-xs" color="red" text={`-${record.discountPercent}%`}>
          <Image
            width={60}
            height={80}
            className="object-cover"
            src={toImageSrc(url)}
            alt="Ảnh sản phẩm"
          />
        </Badge.Ribbon>
      ) : (
        <Image
          width={60}
          height={80}
          className="object-cover"
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
    title: 'Tên sản phẩm',
    dataIndex: 'name',
    render: (value) => <div className="w-24 md:w-32 2xl:w-full line-clamp-2">{value}</div>,
  },
  {
    title: 'Lượt bán',
    dataIndex: 'sold',
  },
]

export default function Campaigns() {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaings] = useState([])

  const [openCreate, setOpenCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [products, setProducts] = useState([])
  const [productLoading, setProductLoading] = useState(false)
  const [openProductList, setOpenProductList] = useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  const [listProductCampaign, setListProductCampaign] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        setCampaings([])
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

  const onOpenProductList = async () => {
    try {
      setOpenProductList(true)
      if (!products.length) {
        setProductLoading(true)
        const params = { page, pageSize }
        const data = await httpService.getWithParams(PRODUCT_API, params)
        setProducts(data.items)
        setTotalItems(data.totalItems)
      }
    } catch (error) {
      message.error(showError(error))
    } finally {
      setProductLoading(false)
    }
  }

  const onSelectProduct = (newKeys) => {
    setSelectedRowKeys(newKeys)
  }

  const onCreate = async (values) => {
    if (!selectedProducts.length) {
      message.error('Vui lòng chọn sản phẩm')
      return
    }
    try {
      setCreateLoading(true)
      console.log(listProductCampaign)
    } catch (error) {
    } finally {
      setCreateLoading(false)
    }
  }

  const onCloseCreateCampaign = () => {
    setOpenCreate(false)
    setSelectedProducts([])
    setSelectedRowKeys([])
  }

  useEffect(() => {
    setListProductCampaign((pre) => pre.filter((e) => selectedProducts.includes(e.productId)))
  }, [selectedProducts])

  const onCloseProduct = () => {
    setOpenProductList(false)
    if (selectedProducts !== selectedRowKeys) setSelectedRowKeys(selectedProducts)
  }

  const handleConfirmProduct = () => {
    setSelectedProducts(selectedRowKeys)
    setOpenProductList(false)
  }

  const onChangeProductCampaign = (id, objectValue) => {
    setListProductCampaign((pre) => {
      if (!pre.some((e) => e.productId === id)) {
        return [...pre, { productId: id, value: { ...objectValue } }]
      }
      return pre.map((item) => {
        if (item.productId === id) {
          return { ...item, value: { ...item.value, ...objectValue } }
        }
        return item
      })
    })
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink className="py-2" breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex justify-between py-4">
            <Form.Item layout="horizontal" label="Lưu ý" required>
              <div>
                - Sản phẩm có nhiều hơn một chiến dịch, mức giảm giá sẽ áp dụng đối với chiến dịch
                có mức giảm giá lớn nhất bao gồm mức giảm giá gốc.
              </div>
              <div>- Giảm giá của chiến dịch sẽ không được cộng dồn với mức giảm giá gốc.</div>
            </Form.Item>
            <Button onClick={() => setOpenCreate(true)} type="primary" size="large">
              <PlusOutlined /> Tạo chiến dịch
            </Button>
          </div>

          <Table
            // columns={columns(handleDeleteVoucher, onUpdateGlobal, onOpenUserVoucher)}
            dataSource={campaigns}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
            loading={loading}
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
        onCancel={onCloseCreateCampaign}
        centered
        destroyOnClose
        maskClosable={false}
        modalRender={(dom) => (
          <Form layout="vertical" form={form} clearOnDestroy name="campaigns" onFinish={onCreate}>
            {dom}
          </Form>
        )}
      >
        <div className="grid grid-cols-2 gap-2 bg-white">
          <Form.Item
            name="startDate"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
          >
            <DatePicker className="w-full" size="large" showTime />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
          >
            <DatePicker className="w-full" size="large" showTime />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên chiến dịch"
            className="col-span-full"
            rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch' }]}
          >
            <Input placeholder="Giảm giá mùa hè,...." maxLength={50} showCount size="large" />
          </Form.Item>
        </div>
        <div>
          <div>Thêm sản phẩm cho chiến dịch</div>
          <Button onClick={onOpenProductList} size="large" className="w-full my-2">
            <PlusOutlined />
            Chọn sản phẩm
          </Button>
          <div className="grid grid-cols-2 gap-4">
            {selectedProducts.map((id) => {
              const product = products.find((e) => e.id === id)
              return (
                <div key={id} className="flex items-center gap-2">
                  <Image
                    width={100}
                    height={100}
                    src={toImageSrc(product?.imageUrl)}
                    className="object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="text-xs">Giảm giá (%)</div>
                    <InputNumber
                      onChange={(value) => onChangeProductCampaign(id, { discountPercent: value })}
                      placeholder="10%"
                      min={1}
                      max={100}
                      required
                      className="w-full h-fit"
                    />
                    <div className="text-xs">Số lượng tối đa</div>
                    <InputNumber
                      onChange={(value) => onChangeProductCampaign(id, { quantity: value })}
                      placeholder="1,2,3,.."
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
          width={480}
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
              onChange: onSelectProduct,
            }}
            columns={columns}
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
        </Drawer>
      </Modal>
    </>
  )
}
