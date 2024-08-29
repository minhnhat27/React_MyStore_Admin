import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Image,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Upload,
  App,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CheckOutlined, CloseOutlined, HomeFilled, PlusOutlined } from '@ant-design/icons'
import productService from '../../services/products/productService'
import {
  gender,
  getBase64,
  isEmptyObject,
  toImageSrc,
  sizes,
  showError,
  toTextLabel,
} from '../../services/commonService'
import { useLoading } from '../../App'
import { Link, useParams } from 'react-router-dom'
import BreadcrumbLink from '../../components/BreadcrumbLink'

const breadcrumbItems = (id) => [
  { path: '/', title: <HomeFilled /> },
  {
    path: '/products-management',
    title: 'Sản phẩm',
  },
  {
    title: `Chi tiết sản phẩm #${id}`,
  },
]

export default function ProductDetail() {
  const { id } = useParams()
  const { setIsLoading } = useLoading()
  const { message } = App.useApp()

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const [productAttributes, setProductAttributes] = useState({})
  const [update, setUpdate] = useState(false)

  const [sizeList, setSizeList] = useState([])
  const [fileList, setFileList] = useState([])

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setIsLoading(true)

        const data = await productService.fetchProductAttributes()
        Object.keys(data).forEach((key) => (data[key] = toTextLabel(data[key])))
        setProductAttributes(data)
        setLoading(false)

        const res = await productService.getProduct(id)
        form.setFieldsValue(res.data)

        const sizeIds = res.data.sizesAndQuantities?.map((item) => item.sizeId)
        form.setFieldValue('sizes', sizeIds)

        setSizeList(res.data.sizesAndQuantities)

        const files = res.data.imageUrls.map((item) => ({
          originUrl: item,
          url: toImageSrc(item),
        }))
        setFileList(files)
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, form, setIsLoading])

  const handleSelectSize = (value) => {
    const newListSize = value.map((item) => {
      const exist = sizeList.find((e) => e.sizeId === item)
      return exist ? exist : { sizeId: item }
    })
    setSizeList(newListSize)
  }

  const handleSetSizeValue = (obj) => {
    const newList = sizeList.map((item) =>
      item.sizeId === obj.sizeId ? { ...item, ...obj } : item,
    )
    setSizeList(newList)
    //console.log(newList)
    setUpdate(true)
  }

  const updateProduct = async () => {
    try {
      setUpdateLoading(true)
      const formData = new FormData()

      fileList.forEach((item, i) =>
        item.originFileObj
          ? formData.append(`images[${i}]`, item.originFileObj)
          : formData.append(`imageUrls[${i}]`, item.originUrl),
      )

      sizeList.forEach((item, i) => {
        Object.keys(item).forEach((key) => {
          formData.append(`sizesAndQuantities[${i}].${key}`, item[key])
        })
      })

      const values = form.getFieldsValue()
      const data = {
        ...values,
        enable: values.enable ?? true,
        description: values.description ?? '',
        discountPercent: values.discountPercent ?? 0,
      }
      delete data.imageUrls
      delete data.sizeIds

      data.materialIds.forEach((item, i) => formData.append(`materialIds[${i}]`, item))
      delete data.materialIds

      Object.keys(data).forEach((key) => formData.append(key, data[key]))

      try {
        await productService.update(id, formData)
        message.success('Successfully')
        setUpdate(false)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setUpdateLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems(id)} />
        <Form
          form={form}
          onValuesChange={() => setUpdate(true)}
          disabled={updateLoading}
          onFinish={updateProduct}
          layout="vertical"
          className="grid gap-3 grid-cols-1 md:grid-cols-2"
        >
          <Card className="drop-shadow h-fit">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input
                count={{
                  show: true,
                  max: 50,
                }}
                maxLength={50}
                size="large"
                placeholder="Abc..."
              />
            </Form.Item>
            <div className="grid gap-2 md:grid-cols-3">
              <Form.Item
                label="Thương hiệu"
                name="brandId"
                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Chọn"
                  options={productAttributes.brands}
                />
              </Form.Item>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Chọn"
                  options={productAttributes.categories}
                />
              </Form.Item>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select className="w-full" size="large" placeholder="Chọn" options={gender} />
              </Form.Item>
            </div>
            <Form.Item
              label="Chất liệu"
              name="materialIds"
              rules={[{ required: true, message: 'Chọn ít nhất 1 chất liệu' }]}
            >
              <Select
                loading={loading}
                className="w-full"
                mode="multiple"
                size="large"
                optionFilterProp="label"
                placeholder="Chọn chất liệu"
                options={productAttributes.materials}
              />
            </Form.Item>
            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea
                id="description"
                rows={6}
                count={{ show: true, max: 500 }}
                placeholder="Áo đẹp..."
                maxLength={500}
              />
            </Form.Item>
          </Card>
          <Card className="drop-shadow h-fit">
            <Form.Item
              label="Hình ảnh"
              name="imageUrls"
              rules={[{ required: true, message: 'Tối thiểu 1 ảnh' }]}
              getValueFromEvent={(e) => e.fileList}
            >
              <Upload
                maxCount={9}
                beforeUpload={() => false}
                listType="picture-card"
                fileList={fileList}
                accept="image/png, image/gif, image/jpeg, image/svg"
                multiple
                onPreview={handlePreview}
                onChange={handleChangeFile}
              >
                {fileList.length >= 9 ? null : (
                  <button type="button">
                    <PlusOutlined />
                    <div>Tải lên</div>
                  </button>
                )}
              </Upload>
            </Form.Item>
            {previewImage && (
              <Image
                wrapperStyle={{
                  display: 'none',
                }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  size="large"
                  className="w-full col-span-2"
                  formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Price..."
                />
              </Form.Item>
              <Form.Item label="Phần trăm giảm giá" name="discountPercent">
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  className="w-full"
                  defaultValue={0}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace('%', '')}
                  placeholder="5, 10,..."
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Size"
              name="sizes"
              rules={[{ required: true, message: 'Vui lòng chọn size' }]}
              className="space-y-2"
            >
              <Select
                className="w-full"
                size="large"
                optionFilterProp="label"
                placeholder="Thêm size"
                onChange={handleSelectSize}
                options={sizes}
                autoClearSearchValue
                mode="multiple"
              />
            </Form.Item>
            <div className="pb-2 space-y-2">
              {sizeList.map((item, i) => (
                <div key={i} className="grid gap-2 grid-cols-3">
                  <Button size="large">{item.sizeId}</Button>
                  <InputNumber
                    required
                    size="large"
                    className="w-full col-span-2"
                    defaultValue={item.inStock}
                    onChange={(value) =>
                      handleSetSizeValue({ sizeId: item.sizeId, inStock: value })
                    }
                    type="number"
                    placeholder="Số lượng kho..."
                  />
                </div>
              ))}
            </div>
            <Form.Item label="Kích hoạt sản phẩm" name="enable" valuePropName="checked">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
                className="bg-gray-500"
              />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                disabled={isEmptyObject(productAttributes) || !update || updateLoading}
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                {updateLoading ? <Spin /> : 'Update'}
              </Button>

              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimaryHover: 'rgb(156, 163, 175)',
                    },
                  },
                }}
              >
                <Link to={-1}>
                  <Button type="primary" className="w-full bg-gray-500" size="large">
                    Trở về
                  </Button>
                </Link>
              </ConfigProvider>
            </div>
          </Card>
        </Form>
      </div>
    </>
  )
}
