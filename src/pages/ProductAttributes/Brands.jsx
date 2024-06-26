import { Button, Form, Image, Input, Modal, Spin, Upload, message } from 'antd'
import { getBase64, toBrandImageUrl } from '../../services/commonService'
import { useState } from 'react'
import { PlusOutlined, DeleteTwoTone } from '@ant-design/icons'
import productService from '../../services/productService'
import { useEffect } from 'react'
import { useLoading } from '../../App'

export default function Brand() {
  const { setIsLoading } = useLoading()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addBrandLoading, setAddBrandLoading] = useState(false)

  const [form] = Form.useForm()
  const [update, setUpdate] = useState(false)
  const [open, setOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const [brands, setBrands] = useState([])
  const [brandDelete, setBrandDelete] = useState({})

  useEffect(() => {
    setIsLoading(true)
    productService
      .getBrands()
      .then((res) => setBrands(res.data))
      .catch((err) => message.error(err.response.data || err.message))
      .finally(() => setIsLoading(false))
  }, [update, setIsLoading])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  const addBrand = () => {
    setAddBrandLoading(true)
    const formData = new FormData()
    const data = { ...form.getFieldsValue(), image: fileList[0].originFileObj }
    Object.keys(data).forEach((key) => formData.append(key, data[key]))

    productService
      .addBrand(formData)
      .then(() => {
        form.resetFields()
        setFileList([])
        setUpdate(!update)
        message.success('Successfully')
      })
      .catch((err) => message.error(err.response.data || err.message))
      .finally(() => setAddBrandLoading(false))
  }

  const confirmDelete = () => {
    setDeleteLoading(true)
    productService
      .deleteBrand(brandDelete.id)
      .then(() => {
        setUpdate(!update)
        message.success('Success')
      })
      .catch((err) => message.error(err.response.data || err.message))
      .finally(() => {
        setOpen(false)
        setDeleteLoading(false)
      })
  }

  return (
    <>
      <Modal
        title={`Confirm delete ${brandDelete.name} brand`}
        open={open}
        onOk={confirmDelete}
        onCancel={() => {
          setOpen(false)
          setBrandDelete({})
        }}
        okText={deleteLoading ? <Spin /> : 'OK'}
        okType="danger"
        okButtonProps={{ disabled: deleteLoading, type: 'primary' }}
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <p>Are you sure you want to delete this brand?</p>
      </Modal>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Brands Lists</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Brands List</span>
          </div>
        </div>
        <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
          <div className="p-2 h-fit md:col-span-2 bg-white rounded-lg drop-shadow">
            <div className="relative overflow-x-auto px-4">
              <table className="w-full text-sm text-center min-w-fit rtl:text-right text-gray-700 dark:text-gray-400">
                <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="select-none">
                    <th scope="col" className="p-2">
                      ID
                    </th>
                    <th scope="col" className="p-2">
                      Name
                    </th>
                    <th scope="col" className="p-2">
                      Image
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((item, i) => (
                    <tr key={i} className="bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item.id}
                      </th>
                      <td className="py-4">{item.name}</td>
                      <td className="py-4 text-center">
                        <Image
                          width={100}
                          height={100}
                          className="object-contain"
                          src={toBrandImageUrl(item.imageUrl)}
                          alt=""
                        />
                      </td>
                      <td className="py-4">
                        <DeleteTwoTone
                          onClick={() => {
                            setBrandDelete(item)
                            setOpen(true)
                          }}
                          className="cursor-pointer select-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="py-2 px-4 h-fit bg-white rounded-lg drop-shadow">
            <span className="text-gray-700 font-bold">Add new brand</span>
            <Form form={form} disabled={addBrandLoading} onFinish={addBrand}>
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

              <Button type="primary" htmlType="submit" className="w-full" size="large">
                {addBrandLoading ? <Spin /> : 'Save'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
