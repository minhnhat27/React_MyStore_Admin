import { useLoading } from '../../App'
import { Button, Form, Input, Modal, Spin, message } from 'antd'
import { useState } from 'react'
import { DeleteTwoTone } from '@ant-design/icons'
import productService from '../../services/productService'
import { useEffect } from 'react'

export default function Materials() {
  const { setIsLoading } = useLoading()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addMaterialLoading, setAddMaterialLoading] = useState(false)

  const [form] = Form.useForm()
  const [update, setUpdate] = useState(false)
  const [open, setOpen] = useState(false)

  const [materials, setMaterials] = useState([])
  const [materialDelete, setMaterialDelete] = useState({})

  useEffect(() => {
    setIsLoading(true)
    productService
      .getMaterials()
      .then((res) => setMaterials(res.data))
      .catch((err) => message.error(err.message))
      .finally(() => setIsLoading(false))
  }, [update, setIsLoading])

  const addMaterial = () => {
    setAddMaterialLoading(true)
    productService
      .addMaterial(form.getFieldsValue())
      .then(() => {
        form.resetFields()
        setUpdate(!update)
        message.success('Successfully')
      })
      .catch((err) => message.error(err.message))
      .finally(() => setAddMaterialLoading(false))
  }

  const confirmDelete = () => {
    setDeleteLoading(true)
    productService
      .deleteMaterial(materialDelete.id)
      .then(() => {
        setUpdate(!update)
        message.success('Successfully')
      })
      .catch((err) => message.error(err.message))
      .finally(() => {
        setOpen(false)
        setDeleteLoading(false)
      })
  }
  return (
    <>
      <Modal
        title={`Confirm delete material ${materialDelete.name}`}
        open={open}
        closable={false}
        onOk={confirmDelete}
        onCancel={() => {
          setOpen(false)
          setMaterialDelete({})
        }}
        okText={deleteLoading ? <Spin /> : 'OK'}
        okType="danger"
        okButtonProps={{ disabled: deleteLoading }}
        cancelText="Cancel"
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <p>Are you sure you want to delete this material?</p>
      </Modal>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Materials List</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Materials List</span>
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
                  </tr>
                </thead>
                <tbody>
                  {materials.map((item, i) => (
                    <tr key={i} className="bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item.id}
                      </th>
                      <td className="py-4">{item.name}</td>
                      <td className="py-4">
                        <DeleteTwoTone
                          onClick={() => {
                            setMaterialDelete(item)
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
            <span className="text-gray-700 font-bold">Add new material</span>
            <Form form={form} disabled={addMaterialLoading} onFinish={addMaterial}>
              <div>
                <label
                  htmlFor="description "
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Material name <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input
                    count={{
                      show: true,
                      max: 30,
                    }}
                    maxLength={30}
                    size="large"
                    placeholder="Material name..."
                  />
                </Form.Item>
              </div>

              <Button type="primary" htmlType="submit" className="w-full" size="large">
                {addMaterialLoading ? <Spin /> : 'Save'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
