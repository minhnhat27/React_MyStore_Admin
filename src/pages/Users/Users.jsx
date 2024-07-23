import { useEffect, useState } from 'react'
import {
  Breadcrumb,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd'
import userService from '../../services/users/userService'
import { formatDate, showError } from '../../services/commonService'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
const dateFormat = 'YYYY-MM-DD'

const breadcrumbItems = [
  {
    title: 'Users',
  },
]

const columns = (onLockOut, handleUnlock) => [
  {
    title: 'Fullname',
    dataIndex: 'fullname',
    width: 100,
    sorter: (a, b) => a.fullname.localeCompare(b.fullname),
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
        {value ? 'CONFIRMED' : 'UNCONFIRMED'}
      </Tag>
    ),
    filters: [
      { value: true, text: 'Confirmed' },
      { value: false, text: 'Unconfirmed' },
    ],
    onFilter: (value, record) => record.emailConfirmed === value,
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    render: (value) => value !== null && formatDate(value),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: 'Updated At',
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
    onFilter: (value, record) => record.lockedOut === value,
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
  },
  {
    title: 'Action',
    align: 'center',
    render: (_, record) =>
      record.lockedOut ? (
        <Popconfirm title="Are you sure?" onConfirm={() => handleUnlock(record.id)}>
          <Button type="primary" className="flex items-center">
            <UnlockOutlined />
          </Button>
        </Popconfirm>
      ) : (
        <Tooltip title="Lock out">
          <Button
            onClick={() => onLockOut(record)}
            danger
            type="primary"
            className="flex items-center"
          >
            <LockOutlined />
          </Button>
        </Tooltip>
      ),
  },
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [form] = Form.useForm()

  const [isUpdate, setIsUpdate] = useState(false)

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  //paginate
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(10)

  const [userId, setUserId] = useState('')
  const [valueLockout, setValueLockout] = useState(1)
  const [isLockoutModel, setIsLockoutModel] = useState(false)
  const [isLockOutLoading, setIsLockOutLoading] = useState(false)

  const onLockoutChange = (e) => setValueLockout(e.target.value)

  const resetModel = () => {
    setValueLockout(1)
    setUserId('')
    form.resetFields()
  }

  const showModal = () => setIsLockoutModel(true)

  const handleOkLockout = async () => {
    try {
      valueLockout === 2 && (await form.validateFields())
      const endDate =
        valueLockout === 2 ? form.getFieldValue('endDate').format(dateFormat) : '3000-01-01'
      const data = { userId: userId, endDate: endDate }

      setIsLockOutLoading(true)
      userService
        .lockOut(data)
        .then(() => {
          setIsLockoutModel(false)
          resetModel()
          setIsUpdate(!isUpdate)
          message.success('Success')
        })
        .catch((err) => message.error(showError(err)))
        .finally(() => setIsLockOutLoading(false))
    } catch (error) {}
  }

  const handleUnlock = async (id) => {
    const data = { userId: id }
    setIsLockOutLoading(true)
    await userService
      .lockOut(data)
      .then(() => {
        setIsUpdate(!isUpdate)
        message.success('Success')
      })
      .catch((err) => message.error(err.response?.data || err.message))
      .finally(() => setIsLockOutLoading(false))
  }
  const handleCancel = () => {
    setIsLockoutModel(false)
    resetModel()
  }

  useEffect(() => {
    searchKey ? setSearchLoading(true) : setLoading(true)
    userService
      .getAll(currentPage, currentPageSize, searchKey)
      .then((res) => {
        setUsers(res.data?.items)
        setTotalItems(res.data?.totalItems)
      })
      .catch((err) => {
        message.error(showError(err))
        setSearchKey('')
      })
      .finally(() => {
        setLoading(false)
        setSearchLoading(false)
      })
  }, [currentPage, currentPageSize, searchKey, isUpdate])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const onLockOut = (record) => {
    showModal(record.lockedOut)
    setUserId(record.id)
  }

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
        maskClosable={false}
      >
        <div className="space-y-2">
          <p>Are you sure you want to lock out this user?</p>
          <Radio.Group onChange={onLockoutChange} value={valueLockout}>
            <Space direction="vertical">
              <Radio value={1}>Forever</Radio>
              <Radio value={2}>Lockout end</Radio>
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
      <div className="pb-4">
        <Breadcrumb className="py-2" items={breadcrumbItems} />
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
            columns={columns(onLockOut, handleUnlock)}
            dataSource={users}
            rowKey={(record) => record.id}
            className="overflow-x-auto"
            rowHoverable
            pagination={false}
            loading={loading}
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
