import { useLoading } from '../../App'
import Search from '../../components/Search'
import { Button, Form, Input, Modal, Spin } from 'antd'
import { useState } from 'react'
import { DeleteTwoTone } from '@ant-design/icons'
import productService from '../../services/productService'
import notificationService from '../../services/notificationService'
import { useEffect } from 'react'

export default function Sizes() {
  const { setIsLoading } = useLoading()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addSizeLoading, setAddSizeLoading] = useState(false)

  const [form] = Form.useForm()
  const [update, setUpdate] = useState(false)
  const [open, setOpen] = useState(false)

  const [sizes, setSizes] = useState([])
  const [sizeDelete, setSizeDelete] = useState({})

  useEffect(() => {
    setIsLoading(true)
    productService
      .getSizes()
      .then((res) => setSizes(res.data))
      .catch(() => notificationService.Danger('Get failed sizes'))
      .finally(() => setIsLoading(false))
  }, [update, setIsLoading])

  const addSize = () => {
    setAddSizeLoading(true)
    productService
      .addSize(form.getFieldsValue())
      .then(() => {
        form.resetFields()
        setUpdate(!update)
        notificationService.Success('Add successful Size')
      })
      .catch(() => notificationService.Danger('Add failed Size'))
      .finally(() => setAddSizeLoading(false))
  }

  const confirmDelete = () => {
    setDeleteLoading(true)
    productService
      .deleteSize(sizeDelete.id)
      .then(() => {
        setUpdate(!update)
        notificationService.Success('Delete successful Size')
      })
      .catch(() => notificationService.Danger('Delete failed Size'))
      .finally(() => {
        setOpen(false)
        setDeleteLoading(false)
      })
  }
  return (
    <>
      <Modal
        title={`Confirm delete Size ${sizeDelete.name}`}
        open={open}
        closable={false}
        onOk={confirmDelete}
        onCancel={() => {
          setOpen(false)
          setSizeDelete({})
        }}
        okText={deleteLoading ? <Spin /> : 'OK'}
        okType="danger"
        okButtonProps={{ disabled: deleteLoading }}
        cancelText="Cancel"
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <p>Are you sure you want to delete this Size?</p>
      </Modal>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">Sizes List</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">Sizes List</span>
          </div>
        </div>
        <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
          <div className="py-2 px-4 md:col-span-2 bg-white rounded-lg drop-shadow">
            <span className="text-gray-600 text-sm">
              Tip search by Size ID: Each size is provided with a unique ID, which you can rely on
              to find the exact product you need.
            </span>
            <div className="py-4 text-sm flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="hidden sm:block text-gray-500">Showing</span>
                <select
                  id="countries"
                  className="bg-gray-50 border cursor-pointer outline-none w-fit border-gray-300 text-gray-900 text-sm rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex flex-1 items-center space-x-2">
                <span className="hidden sm:block text-gray-500">entries</span>
                <Search />
              </div>
            </div>

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
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((item, i) => (
                    <tr key={i} className="bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                      <th
                        scope="row"
                        className="py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item.id}
                      </th>
                      <td className="py-4">{item.name}</td>
                      <td className="py-4">{item.description}</td>
                      <td className="py-4">
                        <DeleteTwoTone
                          onClick={() => {
                            setSizeDelete(item)
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
            <span className="text-gray-700 font-bold">Add new size</span>
            <Form form={form} disabled={addSizeLoading} onFinish={addSize}>
              <div>
                <label
                  htmlFor="description "
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Size name <span className="text-red-500 font-bold text-lg">*</span>
                </label>
                <Form.Item name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input
                    count={{
                      show: true,
                      max: 10,
                    }}
                    maxLength={10}
                    size="large"
                    placeholder="Size name..."
                  />
                </Form.Item>
                <Form.Item
                  name="description"
                  rules={[{ required: true, message: 'Description is required' }]}
                >
                  <Input.TextArea
                    count={{
                      show: true,
                      max: 100,
                    }}
                    maxLength={100}
                    size="large"
                    placeholder="Description..."
                  />
                </Form.Item>
              </div>
              <Button type="default" htmlType="submit" className="w-full" size="large">
                {addSizeLoading ? <Spin /> : 'Save'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  )
}
