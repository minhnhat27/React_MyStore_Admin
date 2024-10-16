import { useEffect, useState } from 'react'
import {
  App,
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
} from 'antd'

import { formatDate, showError } from '../../services/commonService'
import { HomeFilled, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import httpService from '../../services/http-service'
import { ACCOUNT_API } from '../../services/const'
dayjs.extend(customParseFormat)
const dateFormat = 'YYYY-MM-DD'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Người dùng',
  },
]

const columns = (onLockOut, handleUnlock) => [
  {
    title: 'Họ và tên',
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
  // {
  //   title: 'Xác nhận Email',
  //   dataIndex: 'emailConfirmed',
  //   render: (value) => (
  //     <Tag color={value ? 'green' : 'red'} key={value}>
  //       {value ? 'Đã xác nhận' : 'Chưa xác nhận'}
  //     </Tag>
  //   ),
  //   filters: [
  //     { value: true, text: 'Đã xác nhận' },
  //     { value: false, text: 'Chưa xác nhận' },
  //   ],
  //   onFilter: (value, record) => record.emailConfirmed === value,
  // },
  {
    title: 'Số điện thoại',
    dataIndex: 'phoneNumber',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    render: (value) => value !== null && formatDate(value),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: 'Cập nhật lần cuối',
    dataIndex: 'updatedAt',
    render: (value) => value !== null && formatDate(value),
    sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  },
  {
    title: 'Tình trạng',
    dataIndex: 'lockoutEnd',
    filters: [
      { value: false, text: 'Hoạt động' },
      { value: true, text: 'Bị vô hiệu' },
    ],
    onFilter: (value, record) => record.lockedOut === value,
    render: (value) => {
      if (value !== null) {
        const date = new Date(value)
        return (
          <span className="font-semibold text-red-600">
            {date.getFullYear() >= 3000 ? 'Vĩnh viễn' : formatDate(value)}
          </span>
        )
      } else
        return (
          <Tag color="blue" key={value}>
            Hoạt động
          </Tag>
        )
    },
  },
  {
    title: 'Hành động',
    align: 'center',
    render: (_, record) => (
      <div className="inline-flex">
        {record.lockedOut ? (
          <Popconfirm title="Xác nhận mở khóa?" onConfirm={() => handleUnlock(record.id)}>
            <Button type="primary" className="flex items-center">
              <UnlockOutlined />
            </Button>
          </Popconfirm>
        ) : (
          <Tooltip title="Khóa tài khoản">
            <Button
              onClick={() => onLockOut(record)}
              danger
              type="primary"
              className="flex items-center"
            >
              <LockOutlined />
            </Button>
          </Tooltip>
        )}
      </div>
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
  const { notification } = App.useApp()

  //paginate
  const [totalItems, setTotalItems] = useState(0)
  const [page, setpage] = useState(1)
  const [pageSize, setpageSize] = useState(10)

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
      const data = { endDate: endDate }

      try {
        setIsLockOutLoading(true)
        await httpService.put(ACCOUNT_API + `/lock-out/${userId}`, data)
        setIsUpdate(!isUpdate)
        setIsLockoutModel(false)
        resetModel()
        notification.success({
          message: 'Thành công',
          description: 'Đã khóa tài khoản',
        })
      } catch (error) {
        notification.error({
          message: 'Thất bại',
          description: showError(error),
        })
      } finally {
        setIsLockOutLoading(false)
      }
    } catch {}
  }

  const handleUnlock = async (id) => {
    try {
      setIsLockOutLoading(true)
      const data = { endDate: null }
      await httpService.put(ACCOUNT_API + `/lock-out/${id}`, data)
      setIsUpdate(!isUpdate)
      notification.success({
        message: 'Thành công',
        description: 'Đã mở tài khoản',
      })
    } catch (error) {
      notification.error({
        message: 'Thất bại',
        description: showError(error),
      })
    } finally {
      setIsLockOutLoading(false)
    }
  }

  const handleCancel = () => {
    setIsLockoutModel(false)
    resetModel()
  }

  useEffect(() => {
    searchKey ? setSearchLoading(true) : setLoading(true)

    const fetchData = async () => {
      try {
        const params = { page, pageSize, key: searchKey }
        const data = await httpService.getWithParams(ACCOUNT_API, params)

        setUsers(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        notification.error({
          message: 'Thất bại',
          description: showError(error),
        })
        setSearchKey('')
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, isUpdate, notification])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const onLockOut = (record) => {
    showModal(record.lockedOut)
    setUserId(record.id)
  }

  return (
    <>
      <Modal
        title="Khóa tài khoản"
        open={isLockoutModel}
        okType="danger"
        okButtonProps={{ loading: isLockOutLoading, type: 'primary' }}
        onOk={handleOkLockout}
        cancelButtonProps={{ disabled: isLockOutLoading }}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <div className="space-y-2">
          <Radio.Group onChange={onLockoutChange} value={valueLockout}>
            <Space direction="vertical">
              <Radio value={1}>Vĩnh viễn</Radio>
              <Radio value={2}>Chọn thời gian mở khóa</Radio>
              {valueLockout === 2 && (
                <Form form={form}>
                  <Form.Item
                    name="endDate"
                    rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn' }]}
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
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex space-x-2 py-4">
            <Input.Search
              size="large"
              placeholder="Tên, Email,..."
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
            hideOnSinglePage
            className="py-4"
            align="center"
            total={totalItems}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
            defaultPageSize={pageSize}
            defaultCurrent={page}
            showSizeChanger={true}
            onChange={(newPage, newPageSize) => {
              setpage(newPage)
              setpageSize(newPageSize)
            }}
          />
        </div>
      </div>
    </>
  )
}
