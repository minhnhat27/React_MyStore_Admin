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
  isEmptyObject,
  itemRender,
  showError,
  sizes,
  transformDataToLabelValue,
} from '../../services/commonService'
import { useAntdMessage } from '../../App'
import { useNavigate } from 'react-router-dom'

const breadcrumbItems = [
  {
    path: '/products-management',
    title: 'Products',
  },
  {
    title: 'Add New',
  },
]

export default function AddProduct() {
  const navigate = useNavigate()
  const { showMessage } = useAntdMessage()

  const [productAttributes, setProductAttributes] = useState({})
  const [size, setSize] = useState([])
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [sizeList, setSizeList] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const [update, setUpdate] = useState(false)

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  useEffect(() => {
    setLoading(true)
    productService
      .fetchProductAttributes()
      .then((data) => {
        Object.keys(data).forEach((key) => (data[key] = transformDataToLabelValue(data[key])))
        setProductAttributes(data)
        setSize(sizes)
      })
      .catch((err) => showMessage.error(showError(err)))
      .finally(() => setLoading(false))
  }, [showMessage])

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
  }

  const createProduct = async () => {
    try {
      setSaveLoading(true)
      const formData = new FormData()
      fileList.forEach((item, i) => formData.append(`images[${i}]`, item.originFileObj))

      sizeList.forEach((item, i) =>
        Object.keys(item).forEach((key) =>
          formData.append(`sizesAndQuantities[${i}].${key}`, item[key]),
        ),
      )
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
        await productService.create(formData)
        form.resetFields()
        setSizeList([])
        setFileList([])
        showMessage.success('Successfully')
        setUpdate(false)
      } catch (error) {
        showMessage.error(showError(error))
      } finally {
        setSaveLoading(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClear = () => {
    form.resetFields()
    setSizeList([])
    setFileList([])
    setUpdate(false)
  }

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" itemRender={itemRender} items={breadcrumbItems} />
        <Form
          form={form}
          disabled={saveLoading}
          onValuesChange={() => setUpdate(true)}
          onFinish={createProduct}
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
          <Card className="drop-shadow h-fit">
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

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                name="price"
                label="Price"
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
              <Form.Item name="discountPercent" label="Giảm giá">
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  className="w-full"
                  defaultValue={0}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace('%', '')}
                  placeholder="Discount..."
                />
              </Form.Item>
            </div>

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
                    className="w-full col-span-2"
                    defaultValue={item.inStock}
                    onChange={(value) =>
                      handleSetSizeValue({ sizeId: item.sizeId, inStock: value })
                    }
                    type="number"
                    placeholder="Quantity..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                disabled={isEmptyObject(productAttributes) || !update || saveLoading}
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
              >
                {saveLoading ? <Spin /> : 'Save'}
              </Button>

              <Button disabled={!update} onClick={handleClear} className="w-full" size="large">
                Clear
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
