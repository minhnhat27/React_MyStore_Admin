import {
  App,
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
import { PlusOutlined, DeleteOutlined, EditTwoTone, HomeFilled } from '@ant-design/icons'
import brandService from '../../services/products/brandService'
import { useEffect } from 'react'
import BreadcrumbLink from '../../components/BreadcrumbLink'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Thuộc tính sản phẩm',
  },
  {
    title: 'Thương hiệu',
  },
]

const columns = (handleDelete, onEdit) => [
  {
    title: 'Tên',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: 'Hình ảnh',
    dataIndex: 'imageUrl',
    align: 'center',
    render: (url) => (
      <Image
        width={100}
        height={100}
        className="object-cover"
        src={toImageSrc(url)}
        alt="photo"
        loading="lazy"
      />
    ),
  },
  {
    title: 'Hành động',
    align: 'center',
    render: (_, record) => (
      <div className="cursor-pointer select-none text-lg inline-flex space-x-2">
        <Tooltip title="Chỉnh sửa">
          <Button className="flex items-center" onClick={() => onEdit(record)}>
            <EditTwoTone />
          </Button>
        </Tooltip>
        <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
          <Button danger className="flex items-center">
            <DeleteOutlined className="text-red-500" />
          </Button>
        </Popconfirm>
      </div>
    ),
  },
]

export default function Brand() {
  const [saveLoading, setSaveLoading] = useState(false)

  const [form] = Form.useForm()
  const [isUpdate, setIsUpdate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const [brands, setBrands] = useState([])
  const [brandId, setBrandId] = useState('')

  const { message } = App.useApp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await brandService.getAll()
        setBrands(res.data)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message])

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
          const newBrands = brands.map((item) => (item.id === brandId ? res.data : item))
          setBrands(newBrands)

          setIsUpdate(false)
          form.resetFields()
          setFileList([])
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
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
          message.success('Thành công')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setSaveLoading(false))
    }
  }

  const handleDelete = async (id) => {
    await brandService
      .remove(id)
      .then(() => {
        setBrands(brands.filter((item) => item.id !== id))
        message.success('Success')
      })
      .catch((err) => message.error(showError(err)))
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
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
          <Card className="h-fit md:col-span-2 bg-white drop-shadow">
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
          <Card title="Thương hiệu" className="h-fit bg-white drop-shadow">
            <Form layout="vertical" form={form} disabled={saveLoading} onFinish={handleSave}>
              <Form.Item
                label="Tên thương hiệu"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input
                  count={{
                    show: true,
                    max: 25,
                  }}
                  maxLength={25}
                  size="large"
                  placeholder="ABC..."
                  allowClear
                />
              </Form.Item>
              <Form.Item
                label="Tải ảnh lên"
                name="image"
                rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
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

              <div className="grid grid-cols-2 gap-2">
                <Button type="primary" htmlType="submit" className="w-full" size="large">
                  {saveLoading ? <Spin /> : isUpdate ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button
                  disabled={!isUpdate || saveLoading}
                  onClick={handleClear}
                  className="w-full"
                  size="large"
                >
                  Làm mới
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  )
}
