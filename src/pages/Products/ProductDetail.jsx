import { useEffect, useState } from 'react'
import { Button, Form, Image, Input, InputNumber, Modal, Select, Spin, Switch, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons'
import productService from '../../services/productService'
import notificationService from '../../services/notificationService'
import {
  gender,
  getBase64,
  toImageSrc,
  transformDataToLabelValue,
  base64toFile,
} from '../../services/userService'
import { useLoading } from '../../App'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ProductDetail() {
  const { setIsLoading } = useLoading()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [productAttributes, setProductAttributes] = useState({})

  const [form] = Form.useForm()
  const [productId, setProductId] = useState(0)
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
    const id = params.get('id')
    setProductId(id)
    productService
      .fetchProductAttributes()
      .then((data) => {
        setProductAttributes({
          ...data,
          brands: transformDataToLabelValue(data.brands),
          materials: transformDataToLabelValue(data.materials),
          sizes: transformDataToLabelValue(data.sizes),
          categories: transformDataToLabelValue(data.categories),
        })
        setSize(transformDataToLabelValue(data.sizes))

        productService
          .getProduct(id)
          .then((res) => {
            form.setFieldsValue(res.data)
            const sList = []
            res.data.sizeQuantity.forEach((item) => {
              const s = transformDataToLabelValue(data.sizes).find((e) => e.id === item.id)
              delete item.id
              sList.push({ ...s, opt: { ...item } })
            })
            setSizeList(sList)

            const files = []
            res.data.images.forEach((item, i) => {
              const file = base64toFile(item, 'image' + i)
              files.push({ thumbUrl: toImageSrc(item), originFileObj: file })
            })
            setFileList(files)
          })
          .catch((res) => notificationService.Danger(res.message))
          .finally(() => setIsLoading(false))
      })
      .catch(() => {
        setIsLoading(false)
        notificationService.Danger('Get failed Product Attributes')
      })
  }, [params, form, setIsLoading])

  const handleSelectSize = (value) => {
    var items = []
    value.forEach((item) => {
      const s = sizeList.find((e) => e.id === item)
      if (s) items.push(s)
      else {
        const t = size.find((e) => e.value === item)
        items.push(t)
      }
    })
    setSizeList([...items])
  }

  const handleSetSizeValue = (id, opt) => {
    const newList = sizeList.map((item) => {
      if (item.value === id) {
        return { ...item, opt: { ...item.opt, ...opt } }
      }
      return item
    })
    setSizeList(newList)
  }

  const updateProduct = () => {
    setUpdateLoading(true)
    const newSizeList = sizeList.map((item) => {
      return {
        id: item.value,
        ...item.opt,
        discount: item.opt?.discount ?? 0,
      }
    })

    const formData = new FormData()
    formData.append('id', productId)
    fileList.forEach((item, i) => formData.append(`images[${i}]`, item.originFileObj))

    newSizeList.forEach((item, i) => {
      Object.keys(item).forEach((key) => {
        formData.append(`sizes[${i}].${key}`, item[key])
      })
    })

    const data = {
      ...form.getFieldsValue(),
      enable: form.getFieldValue('enable') ?? true,
      description: form.getFieldValue('description') ?? '',
    }
    delete data.images
    delete data.sizes

    data.materials.forEach((item, i) => formData.append(`materials[${i}]`, item))
    delete data.materials

    Object.keys(data).forEach((key) => formData.append(key, data[key]))

    productService
      .updateProduct(formData)
      .then(() => {
        notificationService.Success('Update successful product')
      })
      .catch(() => notificationService.Danger('Update failed product'))
      .finally(() => setUpdateLoading(false))
  }

  const confirmDelete = () => {
    setDeleteLoading(true)
    productService
      .deleteProduct(productId)
      .then(() => {
        navigate('/products-managment')
        notificationService.Success('Delete successful product')
      })
      .catch(() => notificationService.Danger('Delete failed product'))
      .finally(() => {
        setOpen(false)
        setDeleteLoading(false)
      })
  }

  return (
    <>
      <Modal
        title={`Confirm delete product #${productId}`}
        open={open}
        closable={false}
        onOk={confirmDelete}
        onCancel={() => setOpen(false)}
        okText={deleteLoading ? <Spin /> : 'OK'}
        okType="danger"
        okButtonProps={{ disabled: deleteLoading, type: 'primary' }}
        cancelText="Cancel"
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <p>Are you sure you want to delete this product?</p>
      </Modal>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Product Detail #{productId}</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span>Products List</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Product Detail #{productId}</span>
          </div>
        </div>
        <Form
          form={form}
          disabled={updateLoading}
          onFinish={updateProduct}
          className="grid gap-2 grid-cols-1 md:grid-cols-2"
        >
          <div className="p-4 bg-white rounded-lg drop-shadow space-y-2 h-fit">
            <div>
              <label
                htmlFor="product_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Product name <span className="text-red-500 font-bold text-lg">*</span>
              </label>
              <Form.Item
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
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <label
                  htmlFor="brand"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Brand <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
                  <Select
                    className="w-full"
                    size="large"
                    optionFilterProp="label"
                    placeholder="Choose brand"
                    options={productAttributes.brands}
                  />
                </Form.Item>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item
                  name="category"
                  rules={[{ required: true, message: 'Category is required' }]}
                >
                  <Select
                    className="w-full"
                    size="large"
                    optionFilterProp="label"
                    placeholder="Choose category"
                    options={productAttributes.categories}
                  />
                </Form.Item>
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Gender <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item
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
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Material <span className="text-red-500 font-bold text-lg">*</span>
              </label>
              <Form.Item
                name="materials"
                rules={[{ required: true, message: 'Materials is required' }]}
              >
                <Select
                  className="w-full"
                  mode="multiple"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Choose materials"
                  options={productAttributes.materials}
                />
              </Form.Item>
            </div>

            <div>
              <label
                htmlFor="description "
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Description
              </label>
              <Form.Item name="description">
                <TextArea
                  id="description"
                  rows={3}
                  count={{ show: true, max: 500 }}
                  placeholder="Product description..."
                  maxLength={500}
                />
              </Form.Item>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg drop-shadow space-y-2 h-fit">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Upload images <span className="text-red-500 font-bold text-lg">*</span>
              </label>
              <Form.Item
                name="images"
                extra="Pay attention to the quality of the pictures you add, comply with the background
                    color standards. Pictures must be in certain dimensions. Notice that the product
                    shows all the details"
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
            </div>

            <div>
              <label
                htmlFor="size"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Add size <span className="text-red-500 font-bold text-lg">*</span>
              </label>
              <Form.Item name="sizes" rules={[{ required: true, message: 'Size is required' }]}>
                <Select
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  placeholder="Add size"
                  onChange={handleSelectSize}
                  options={productAttributes.sizes}
                  autoClearSearchValue
                  mode="multiple"
                />
              </Form.Item>
            </div>
            {sizeList.map((item, i) => {
              return (
                <div key={i} className="grid gap-2 grid-cols-5">
                  <Button size="large">{item.label}</Button>
                  <Input
                    required
                    size="large"
                    defaultValue={item.opt?.quantity}
                    onChange={(e) => handleSetSizeValue(item.value, { quantity: e.target.value })}
                    type="number"
                    placeholder="Quantity..."
                  />
                  <InputNumber
                    required
                    size="large"
                    className="w-full col-span-2"
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                    defaultValue={item.opt?.price}
                    onChange={(value) => handleSetSizeValue(item.value, { price: value })}
                    placeholder="Price..."
                  />
                  <InputNumber
                    size="large"
                    min={0}
                    max={100}
                    className="w-full"
                    defaultValue={item.opt?.discount ?? 0}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace('%', '')}
                    onChange={(value) => handleSetSizeValue(item.value, { discount: value })}
                    placeholder="Discount..."
                  />
                </div>
              )
            })}

            <div className="flex space-x-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                Enable
              </label>
              <Form.Item name="enable" valuePropName="checked">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                  className="bg-gray-500"
                />
              </Form.Item>
            </div>
            <div className="flex space-x-2">
              <Button type="primary" htmlType="submit" className="w-full bg-blue-500" size="large">
                {updateLoading ? <Spin /> : 'Save'}
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => setOpen(true)}
                className="w-full"
                size="large"
              >
                Delete
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </>
  )
}
