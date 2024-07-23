import { useEffect, useState } from 'react'
import {
  Breadcrumb,
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
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons'
import productService from '../../services/products/productService'
import {
  gender,
  getBase64,
  transformDataToLabelValue,
  isEmptyObject,
  toImageSrc,
  sizes,
  showError,
  itemRender,
} from '../../services/commonService'
import { useAntdMessage, useLoading } from '../../App'
import { useNavigate, useParams } from 'react-router-dom'

const breadcrumbItems = (id) => [
  {
    path: '/products-management',
    title: 'Product List',
  },
  {
    title: `Product detail #${id}`,
  },
]

export default function ProductDetail() {
  const { setIsLoading } = useLoading()
  const { showMessage } = useAntdMessage()
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const [productAttributes, setProductAttributes] = useState({})
  const [update, setUpdate] = useState(false)

  const [form] = Form.useForm()
  const [size, setSize] = useState([])
  const [sizeList, setSizeList] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  useEffect(() => {
    setIsLoading(true)
    setLoading(true)
    try {
      const fetchData = async () => {
        await productService.fetchProductAttributes().then((data) => {
          Object.keys(data).forEach((key) => (data[key] = transformDataToLabelValue(data[key])))
          setProductAttributes(data)
          setSize(sizes)
          setLoading(false)
        })
        productService
          .getProduct(id)
          .then((res) => {
            form.setFieldsValue(res.data)
            setSizeList(res.data.sizesAndQuantities)

            const files = res.data.imageUrls.map((item) => ({
              originUrl: item,
              url: toImageSrc(item),
            }))
            setFileList(files)
          })
          .finally(() => setIsLoading(false))
      }
      fetchData()
    } catch (err) {
      setLoading(false)
      setIsLoading(false)
    }
  }, [id, form, setIsLoading])

  const handleSelectSize = (value) => {
    var items = value.map((item) => ({
      sizeId: size.find((e) => e.value === item)?.value,
    }))
    setSizeList(items)
  }

  const handleSetSizeValue = (obj) => {
    const newList = sizeList.map((item) =>
      item.sizeId === obj.sizeId ? { ...item, ...obj } : item,
    )
    setSizeList(newList)
    setUpdate(true)
  }

  const updateProduct = () => {
    try {
      setUpdateLoading(true)
      const formData = new FormData()

      const newSizeList = sizeList.map((item) => ({
        ...item,
        discountPercent: item.discountPercent ?? 0,
      }))

      fileList.forEach((item, i) =>
        item.originFileObj
          ? formData.append(`images[${i}]`, item.originFileObj)
          : formData.append(`imageUrls[${i}]`, item.originUrl),
      )

      newSizeList.forEach((item, i) => {
        Object.keys(item).forEach((key) => {
          formData.append(`sizesAndQuantities[${i}].${key}`, item[key])
        })
      })

      const data = {
        ...form.getFieldsValue(),
        enable: form.getFieldValue('enable') ?? true,
        description: form.getFieldValue('description') ?? '',
      }
      delete data.imageUrls
      delete data.sizeIds

      data.materialIds.forEach((item, i) => formData.append(`materials[${i}]`, item))
      delete data.materials

      Object.keys(data).forEach((key) => formData.append(key, data[key]))

      productService
        .update(id, formData)
        .then(() => {
          showMessage.success('Successfully')
          setUpdate(false)
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setUpdateLoading(false))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" itemRender={itemRender} items={breadcrumbItems(id)} />
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
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Product name is required' }]}
            >
              <Input
                count={{
                  show: true,
                  max: 50,
                }}
                maxLength={50}
                size="large"
                placeholder="Product name..."
              />
            </Form.Item>
            <div className="grid gap-2 md:grid-cols-3">
              <Form.Item
                label="Brand"
                name="brandId"
                rules={[{ required: true, message: 'Brand is required' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Choose brand"
                  options={productAttributes.brands}
                />
              </Form.Item>
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Choose category"
                  options={productAttributes.categories}
                />
              </Form.Item>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select
                  className="w-full"
                  size="large"
                  placeholder="Choose gender"
                  options={gender}
                />
              </Form.Item>
            </div>
            <Form.Item
              label="Material"
              name="materialIds"
              rules={[{ required: true, message: 'Materials is required' }]}
            >
              <Select
                loading={loading}
                className="w-full"
                mode="multiple"
                size="large"
                optionFilterProp="label"
                placeholder="Choose materials"
                options={productAttributes.materials}
              />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea
                id="description"
                rows={6}
                count={{ show: true, max: 500 }}
                placeholder="Product description..."
                maxLength={500}
              />
            </Form.Item>
          </Card>
          <Card className="drop-shadow">
            <Form.Item
              label="Upload Images"
              name="imageUrls"
              rules={[{ required: true, message: 'Minimun 1 image' }]}
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
                    <div>Upload</div>
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
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber
                size="large"
                className="w-full col-span-2"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                placeholder="Price..."
              />
            </Form.Item>
            <Form.Item
              label="Add size"
              name="sizeIds"
              rules={[{ required: true, message: 'Size is required' }]}
              className="space-y-2"
            >
              <Select
                className="w-full"
                size="large"
                optionFilterProp="label"
                placeholder="Add size"
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
                    className="w-full"
                    defaultValue={item.inStock}
                    onChange={(value) =>
                      handleSetSizeValue({ sizeId: item.sizeId, inStock: value })
                    }
                    type="number"
                    placeholder="Quantity..."
                  />
                  <InputNumber
                    size="large"
                    min={0}
                    max={100}
                    className="w-full"
                    defaultValue={item.discountPercent}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace('%', '')}
                    onChange={(value) =>
                      handleSetSizeValue({ sizeId: item.sizeId, discountPercent: value })
                    }
                    placeholder="Discount..."
                  />
                </div>
              ))}
            </div>
            <Form.Item label="Enable" name="enable" valuePropName="checked">
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
                <Button
                  type="primary"
                  onClick={() => navigate(-1)}
                  className="w-full bg-gray-500"
                  size="large"
                >
                  Back
                </Button>
              </ConfigProvider>
            </div>
          </Card>
        </Form>
      </div>
    </>
  )
}
