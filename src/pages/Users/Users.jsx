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
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'

import { formatDateTime, showError } from '../../services/commonService'
import {
  EditOutlined,
  HomeFilled,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UnlockOutlined,
  UserOutlined,
} from '@ant-design/icons'

import dayjs from 'dayjs'
// import customParseFormat from 'dayjs/plugin/customParseFormat'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import httpService from '../../services/http-service'
import { ACCOUNT_API, Roles, UserRole } from '../../services/const'
import authService from '../../services/authService'
// dayjs.extend(customParseFormat)
// const dateFormat = 'YYYY-MM-DD'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Người dùng',
  },
]

const columns = (onLockOut, handleUnlock, onEditUser) => [
  {
    title: 'Họ và tên',
    dataIndex: 'fullname',
    width: 150,
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
    render: (value) => value !== null && formatDateTime(value),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: 'Cập nhật lần cuối',
    dataIndex: 'updatedAt',
    render: (value) => value !== null && formatDateTime(value),
    sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  },
  {
    title: 'Tình trạng',
    dataIndex: 'lockoutEnd',
    filters: [
      { value: false, text: 'Hoạt động' },
      { value: true, text: 'Bị khóa' },
    ],
    onFilter: (value, record) => record.lockedOut === value,
    render: (value) => {
      if (value !== null) {
        const date = new Date(value)
        return (
          <span className="font-semibold text-red-600">
            {date.getFullYear() >= 3000 ? 'Vĩnh viễn' : formatDateTime(value)}
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
      <>
        {authService.getCurrentUser().session === record.session}
        <Button className="m-1" onClick={() => onEditUser(record.id)}>
          <EditOutlined />
        </Button>
        {record.lockedOut ? (
          <Popconfirm title="Xác nhận mở khóa?" onConfirm={() => handleUnlock(record.id)}>
            <Button type="primary" className="m-1">
              <UnlockOutlined />
            </Button>
          </Popconfirm>
        ) : (
          <Tooltip title="Khóa tài khoản">
            <Button onClick={() => onLockOut(record)} danger type="primary" className="m-1">
              <LockOutlined />
            </Button>
          </Tooltip>
        )}
      </>
    ),
  },
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const { message } = App.useApp()

  //paginate
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [role, setRole] = useState(UserRole)

  const [userId, setUserId] = useState()
  const [valueLockout, setValueLockout] = useState(1)
  const [isLockoutModel, setIsLockoutModel] = useState(false)
  const [isLockOutLoading, setIsLockOutLoading] = useState(false)

  const [isOpenUser, setIsOpenUser] = useState(false)

  const onLockoutChange = (e) => setValueLockout(e.target.value)

  const resetModel = () => {
    setValueLockout(1)
    setUserId(undefined)
    form.resetFields()
  }

  const showModal = () => setIsLockoutModel(true)

  const handleOkLockout = async () => {
    try {
      valueLockout === 2 && (await form.validateFields())
      const endDate = valueLockout === 2 ? form.getFieldValue('endDate').format() : '3000-01-01'
      const data = { endDate: endDate }
      try {
        if (userId) {
          setIsLockOutLoading(true)
          await httpService.put(ACCOUNT_API + `/lock-out/${userId}`, data)
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    lockoutEnd:
                      valueLockout === 2
                        ? form.getFieldValue('endDate').add(1, 'day')
                        : '3000-01-01',
                    lockedOut: true,
                  }
                : user,
            ),
          )
          setIsLockoutModel(false)
          resetModel()
          message.success('Đã khóa tài khoản')
        } else throw new Error('Người dùng không hợp lệ')
      } catch (error) {
        message.error(showError(error))
      } finally {
        setIsLockOutLoading(false)
      }
    } catch (error) {}
  }

  const handleUnlock = async (id) => {
    try {
      setIsLockOutLoading(true)
      const data = { endDate: null }
      await httpService.put(ACCOUNT_API + `/lock-out/${id}`, data)
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, lockoutEnd: null, lockedOut: false } : user,
        ),
      )
      message.success('Đã mở tài khoản')
    } catch (error) {
      message.error(showError(error))
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
        const params = { page, pageSize, key: searchKey, role }
        const data = await httpService.getWithParams(ACCOUNT_API, params)

        setUsers(data?.items)
        setTotalItems(data?.totalItems)
      } catch (error) {
        message.error(showError(error))
        setSearchKey('')
      } finally {
        setLoading(false)
        setSearchLoading(false)
      }
    }
    fetchData()
  }, [page, pageSize, searchKey, message, role])

  const handleSearch = (key) => key && key !== searchKey && setSearchKey(key)

  const onLockOut = (record) => {
    showModal(record.lockedOut)
    setUserId(record.id)
  }

  const onEditUser = (id) => {
    setUserId(id)
    setIsOpenUser(true)
  }

  const closeModalUser = () => {
    setIsOpenUser(false)
    setUserId(undefined)
  }

  const onCreateOrUpdateUser = async (values) => {
    console.log(values)
    try {
      if (userId) {
        const user = await httpService.put(`${ACCOUNT_API}/${userId}`, values)
        if (values?.roles?.includes(role))
          setUsers((prev) => prev.map((e) => (e.id === userId ? user : e)))
        else setUsers((prev) => prev.filter((e) => e.id !== userId))
        closeModalUser()
        message.success('Cập nhật thông tin tài khoản thành công')
      } else {
        const user = await httpService.post(ACCOUNT_API, values)
        if (values?.roles?.includes(role)) setUsers((prev) => [user, ...prev])
        closeModalUser()
        message.success('Tạo tài khoản thành công')
      }
    } catch (error) {
      message.error(showError(error))
    }
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="py-2 px-4 space-y-2 bg-white rounded-lg drop-shadow">
          <div className="flex flex-col md:flex-row gap-2 py-4">
            <Select
              options={Object.entries(Roles).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
              onChange={(value) => {
                setPage(1)
                setRole(value)
              }}
              size="large"
              defaultValue={role}
              className="w-full md:w-48"
            />
            <div className="flex-1 flex flex-row gap-2">
              <Input.Search
                size="large"
                placeholder="Tên, Email,..."
                allowClear
                loading={searchLoading}
                onSearch={(key) => handleSearch(key)}
                onChange={(e) => e.target.value === '' && setSearchKey('')}
              />
              <Button onClick={() => setIsOpenUser(true)} size="large" type="primary">
                <PlusOutlined />
              </Button>
            </div>
          </div>

          <Table
            columns={columns(onLockOut, handleUnlock, onEditUser)}
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
              setPage(newPage)
              setPageSize(newPageSize)
            }}
          />
        </div>
      </div>
      <Modal
        title="Khóa tài khoản"
        open={isLockoutModel}
        okType="danger"
        centered
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
              <Form form={form}>
                {valueLockout === 2 && (
                  <Form.Item
                    name="endDate"
                    rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn' }]}
                  >
                    <DatePicker allowClear={false} minDate={dayjs(new Date().getTime())} />
                  </Form.Item>
                )}
              </Form>
            </Space>
          </Radio.Group>
        </div>
      </Modal>

      <Modal
        title={userId ? 'Cập nhật thông tin dùng mới' : 'Thêm người dùng mới'}
        open={isOpenUser}
        centered
        onCancel={closeModalUser}
        confirmLoading={isLockOutLoading}
        maskClosable={false}
        destroyOnClose
        okButtonProps={{ htmlType: 'submit' }}
        okText={userId ? 'Cập nhật' : 'Thêm'}
        modalRender={(dom) => (
          <Form
            form={form}
            layout="vertical"
            initialValues={userId ? users.find((e) => e.id === userId) : { roles: [UserRole] }}
            clearOnDestroy
            onFinish={onCreateOrUpdateUser}
          >
            {dom}
          </Form>
        )}
      >
        <div className="flex gap-2">
          <Form.Item name="fullname" label="Tên người dùng">
            <Input
              prefix={<UserOutlined className="text-gray-300 mx-1" />}
              placeholder="Tên"
              size="large"
            />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phoneNumber">
            <Input
              prefix={<PhoneOutlined className="text-gray-300 mx-1" />}
              placeholder="Số điện thoại"
              size="large"
            />
          </Form.Item>
        </div>
        <Form.Item
          name="email"
          label="Email"
          hasFeedback
          rules={[
            {
              type: 'email',
              message: 'Email không hợp lệ',
            },
            { required: true, message: 'Vui lòng nhập Email' },
          ]}
        >
          <Input
            allowClear
            prefix={<MailOutlined className="text-gray-300 mx-1" />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>
        <Form.Item
          label={userId ? 'Đổi mật khẩu mới' : 'Mật khẩu'}
          name="password"
          rules={[
            userId || { required: true, message: 'Vui lòng nhập mật khẩu' },
            {
              pattern: /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$/,
              message: 'Mật khẩu ít nhất 6 ký tự, 1 ký tự hoa, thường và 1 số.',
            },
          ]}
        >
          <Input.Password
            allowClear
            prefix={<LockOutlined className="text-gray-300 mx-1" />}
            placeholder="Mật khẩu"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="roles"
          label="Quyền"
          rules={[{ required: true, message: 'Chọn ít nhất 1 quyền' }]}
        >
          <Select
            options={Object.entries(Roles).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            mode="multiple"
            size="large"
          />
        </Form.Item>
      </Modal>
    </>
  )
}
