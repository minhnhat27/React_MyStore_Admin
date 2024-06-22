import { useLoading } from '../../App'
import { useEffect, useState } from 'react'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Radio,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd'
import userService from '../../services/userService'
import { formatDate } from '../../services/commonService'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
const dateFormat = 'YYYY-MM-DD'

export default function Users() {
  const { setIsLoading } = useLoading()
  const [users, setUsers] = useState([])
  const [form] = Form.useForm()

  const [isUpdate, setIsUpdate] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (value) => (
        <div className="font-semibold w-14 md:w-16 xl:w-20 2xl:w-full truncate">#{value}</div>
      ),
    },
    {
      title: 'Fullname',
      dataIndex: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (value) => <div className="w-24 md:w-32 2xl:w-full truncate">{value}</div>,
      width: 100,
    },
    {
      title: 'Email Confirmed',
      dataIndex: 'emailConfirmed',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'} key={value}>
          {value ? 'Confirmed'.toUpperCase() : 'Unconfirmed'.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      render: (value) => value !== null && formatDate(value),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'UpdatedAt',
      dataIndex: 'updatedAt',
      render: (value) => value !== null && formatDate(value),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: 'Lockout End',
      dataIndex: 'lockoutEnd',
      filters: [
        { value: false, text: 'Active' },
        { value: true, text: 'Locked' },
      ],
      render: (value) => {
        if (value !== null) {
          const date = new Date(value)
          return (
            <span className="font-semibold text-red-600">
              {date.getFullYear() >= 3000 ? 'Forever' : formatDate(value)}
            </span>
          )
        }
      },
      onFilter: (value, record) => record.lockedOut === value,
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.lockedOut ? 'Unlock' : 'Lock out'}>
          <Button
            onClick={() => {
              showModal(record.lockedOut)
              setUserId(record.id)
            }}
            danger={!record.lockedOut}
            type="primary"
            className="flex items-center"
          >
            {record.lockedOut ? <UnlockOutlined /> : <LockOutlined />}
          </Button>
        </Tooltip>
      ),
    },
  ]

  const [userId, setUserId] = useState('')
  const [isLockoutModel, setIsLockoutModel] = useState(false)
  const [isUnlockModel, setIsUnlockModel] = useState(false)

  const [isLockOutLoading, setIsLockOutLoading] = useState(false)

  const [valueLockout, setValueLockout] = useState(1)

  const onLockoutChange = (e) => setValueLockout(e.target.value)

  const showModal = (lockedOut) => (lockedOut ? setIsUnlockModel(true) : setIsLockoutModel(true))

  const handleOkLockout = () => {
    !form.getFieldValue('endDate') && valueLockout === 2 && form.validateFields()

    if (valueLockout === 1 || (form.getFieldValue('endDate') && valueLockout === 2)) {
      const endDate =
        valueLockout === 2 ? form.getFieldValue('endDate').format(dateFormat) : '3000-01-01'
      const data = { userId: userId, endDate: endDate }

      setIsLockOutLoading(true)
      userService
        .lockOut(data)
        .then(() => {
          setIsLockoutModel(false)
          setIsUpdate(!isUpdate)
          message.success('Success')
        })
        .catch((err) => message.error(err.response.data || err.message))
        .finally(() => setIsLockOutLoading(false))
    }
  }
  const handleOkUnlock = () => {
    const data = { userId: userId }
    setIsLockOutLoading(true)
    userService
      .lockOut(data)
      .then(() => {
        setIsUnlockModel(false)
        setIsUpdate(!isUpdate)
        message.success('Success')
      })
      .catch((err) => message.error(err.response.data || err.message))
      .finally(() => setIsLockOutLoading(false))
  }
  const handleCancel = () => {
    setIsUnlockModel(false)
    setIsLockoutModel(false)
    setUserId('')
  }

  useEffect(() => {
    searchKey ? setSearchLoading(true) : setIsLoading(true)
    userService
      .getAll(currentPage, currentPageSize, searchKey)
      .then((res) => {
        setUsers(res.data?.items)
        setTotalItems(res.data?.totalItems)
      })
      .catch((err) => {
        console.log(err)
        message.error(err.response.data || err.message)
        setSearchKey('')
      })
      .finally(() => {
        setIsLoading(false)
        setSearchLoading(false)
      })
  }, [setIsLoading, currentPage, currentPageSize, searchKey, isUpdate])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)
  return (
    <>
      <Modal
        title="Lock Out"
        open={isLockoutModel}
        okType="danger"
        okButtonProps={{ loading: isLockOutLoading, type: 'primary' }}
        onOk={handleOkLockout}
        cancelButtonProps={{ disabled: isLockOutLoading }}
        onCancel={handleCancel}
      >
        <div className="space-y-2">
          <p>Are you sure you want to lock out this user?</p>
          <Radio.Group onChange={onLockoutChange} value={valueLockout}>
            <Space direction="vertical">
              <Radio value={1}>Forever</Radio>
              <Radio value={2}>Lockout end </Radio>
              {valueLockout === 2 && (
                <Form form={form}>
                  <Form.Item
                    name="endDate"
                    rules={[{ required: true, message: 'End date is required' }]}
                  >
                    <DatePicker allowClear={false} minDate={dayjs(new Date().getTime())} />
                  </Form.Item>
                </Form>
              )}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
      <Modal
        title="Unlock"
        open={isUnlockModel}
        okButtonProps={{ loading: isLockOutLoading, type: 'primary' }}
        onOk={handleOkUnlock}
        cancelButtonProps={{ disabled: isLockOutLoading }}
        onCancel={handleCancel}
      >
        <p>Are you sure you want to unlock this user?</p>
      </Modal>
      <div className="pb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-2xl font-bold">User List</div>
          <div className="space-x-2 text-sm">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span className="text-gray-500">User List</span>
          </div>
        </div>
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <span className="text-gray-600 text-sm">
            Tip search by User ID: Each user is provided with a unique ID, which you can rely on to
            find the exact product you need.
          </span>
          <div className="flex space-x-2">
            <Input.Search
              size="large"
              allowClear
              loading={searchLoading}
              onSearch={(key) => handleSearch(key)}
              onChange={(e) => e.target.value === '' && setSearchKey('')}
            />
            <Link to="add-user">
              <Button size="large" type="primary" className="flex items-center">
                + Add new
              </Button>
            </Link>
          </div>

          <Table
            columns={columns}
            dataSource={users}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
          />

          <Pagination
            className="text-center mt-4"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            defaultPageSize={currentPageSize}
            defaultCurrent={currentPage}
            showSizeChanger={true}
            onChange={(newPage, newPageSize) => {
              setCurrentPage(newPage)
              setCurrentPageSize(newPageSize)
            }}
          />
        </div>
      </div>
    </>
  )
}
