import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Image,
  Input,
  Popconfirm,
  Spin,
  Table,
  Tooltip,
  Upload,
} from 'antd'
import { getBase64, showError, toImageSrc } from '../../services/commonService'
import { useState } from 'react'
import { PlusOutlined, DeleteOutlined, EditTwoTone } from '@ant-design/icons'
import brandService from '../../services/products/brandService'
import { useEffect } from 'react'
import { useAntdMessage } from '../../App'

const breadcrumbItems = [
  {
    title: 'Product Attributes',
  },
  {
    title: 'Brands',
  },
]

const columns = (handleDelete, onEdit) => [
  {
    title: 'Name',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: 'Image',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url) => (
      <Image
        width={100}
        height={100}
        className="object-contain"
        src={toImageSrc(url)}
        alt=""
        loading="lazy"
      />
    ),
  },
  {
    title: 'Action',
    align: 'center',
    render: (_, record) => (
      <div className="space-x-4 cursor-pointer select-none text-lg">
        <Tooltip title="Edit">
          <EditTwoTone onClick={() => onEdit(record)} />
        </Tooltip>
        <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
          <DeleteOutlined className="text-red-500" />
        </Popconfirm>
      </div>
    ),
  },
]

export default function Brand() {
  //const [deleteLoading, setDeleteLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const [brands, setBrands] = useState([])
  const [brandId, setBrandId] = useState('')
  const { showMessage } = useAntdMessage()

  useEffect(() => {
    setLoading(true)
    brandService
      .getAll()
      .then((res) => setBrands(res.data))
      .catch((err) => showMessage.error(showError(err)))
      .finally(() => setLoading(false))
  }, [showMessage])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  const handleSave = () => {
    const formData = new FormData()
    setSaveLoading(true)
    if (isUpdate) {
      var imageUrl = form.getFieldValue('image')[0]?.url
      const data = {
        ...form.getFieldsValue(),
        imageUrl: imageUrl,
        image: imageUrl ? null : fileList[0]?.originFileObj,
      }
      Object.keys(data).forEach((key) => formData.append(key, data[key]))

      brandService
        .update(brandId, formData)
        .then((res) => {
          const newBrands = brands.filter((item) => item.id !== brandId)
          setBrands([...newBrands, res.data])
          setIsUpdate(false)
          form.resetFields()
          setFileList([])
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    } else {
      const data = { ...form.getFieldsValue(), image: fileList[0]?.originFileObj }
      Object.keys(data).forEach((key) => formData.append(key, data[key]))

      brandService
        .create(formData)
        .then((res) => {
          setBrands([...brands, res.data])
          form.resetFields()
          setFileList([])
          showMessage.success('Successfully')
        })
        .catch((err) => showMessage.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await brandService
      .remove(id)
      .then(() => {
        setBrands(brands.filter((item) => item.id !== id))
        showMessage.success('Success')
      })
      .catch((err) => showMessage.error(showError(err)))
  }

  const onEdit = (brand) => {
    form.setFieldsValue({
      ...brand,
      image: [
        {
          name: brand.imageUrl,
          url: brand.imageUrl,
        },
      ],
    })
    setFileList([
      {
        name: brand.imageUrl,
        url: toImageSrc(brand.imageUrl),
      },
    ])
    setBrandId(brand.id)
    setIsUpdate(true)
  }

  const handleClear = () => {
    form.resetFields()
    setFileList([])
    setIsUpdate(false)
    setBrandId('')
  }

  return (
    <>
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-2 bg-white drop-shadow">
            <Table
              columns={columns(handleDelete, onEdit)}
              dataSource={brands}
              rowKey={(record) => record.id}
              className="overflow-x-auto"
              rowHoverable
              pagination={false}
              loading={loading}
            />
          </Card>
          <Card className="h-fit bg-white drop-shadow">
            <span className="text-gray-700 font-bold">Add new brand</span>
            <Form form={form} disabled={saveLoading} onFinish={handleSave}>
              <div>
                <label
                  htmlFor="description "
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Brand name <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input
                    count={{
                      show: true,
                      max: 30,
                    }}
                    maxLength={30}
                    size="large"
                    placeholder="Brand name..."
                    allowClear
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Upload image <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item
                  name="image"
                  rules={[{ required: true, message: 'Please choose image' }]}
                  getValueFromEvent={(e) => e.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture-card"
                    fileList={fileList}
                    accept="image/png, image/gif, image/jpeg, image/svg"
                    onPreview={handlePreview}
                    onChange={handleChangeFile}
                  >
                    {fileList.length >= 1 ? null : (
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

              <div className="grid grid-cols-2 gap-2">
                <Button type="primary" htmlType="submit" className="w-full" size="large">
                  {saveLoading ? <Spin /> : isUpdate ? 'Update' : 'Save'}
                </Button>
                <Button
                  disabled={!isUpdate || saveLoading}
                  onClick={handleClear}
                  className="w-full"
                  size="large"
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  )
}
