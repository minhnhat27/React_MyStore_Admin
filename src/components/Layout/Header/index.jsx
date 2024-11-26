import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useChat } from '../../../App'
import authActions from '../../../services/authAction'

import authService from '../../../services/authService'
import {
  App,
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Empty,
  List,
  Popconfirm,
  Popover,
  Skeleton,
  Tooltip,
} from 'antd'
import {
  UserOutlined,
  MoonFilled,
  SunFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageTwoTone,
  BellTwoTone,
  DeleteOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import { RiCheckDoubleFill } from 'react-icons/ri'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { HubConnectionState } from '@microsoft/signalr'
import { AdminRole } from '../../../services/const'
import { formatDateTime } from '../../../services/commonService'

export default function Header({ collapsed, toggleCollapsed }) {
  const { state, dispatch } = useAuth()
  const { chatConnection } = useChat()
  const { notification } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [pathname, setPathname] = useState(location.pathname)
  const [darkMode, setDarkMode] = useState(false)
  const [countConversation, setCountConversation] = useState(0)
  const [countNotification, setCountNotification] = useState(0)

  const [notifications, setNotifications] = useState([])
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [newNotification, setNewNotification] = useState({
    show: false,
    message: undefined,
    timeoutId: undefined,
  })

  const [hasRegistered, setHasRegistered] = useState(false)

  const handleOk = () => {
    authService.logout()
    dispatch(authActions.LOGOUT)
    navigate('/')
  }

  useLayoutEffect(() => {
    setPathname(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode')
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode) ?? true)
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (chatConnection && chatConnection.state === HubConnectionState.Connected && !hasRegistered) {
      try {
        chatConnection.on('onAdmin', (id, message, image) => {
          setPathname((pre) => {
            if (pre !== '/message') {
              const key = `open${Date.now()}`
              notification.info({
                message: <div className="font-semibold">Có tin nhắn mới</div>,
                description: (
                  <>
                    <div>{message}</div>
                    {image && <div>kèm hình ảnh</div>}
                  </>
                ),
                btn: (
                  <Link onClick={() => notification.destroy(key)} to={`/message?id=${id}`}>
                    <Button size="small" type="link" className="p-0">
                      Xem
                    </Button>
                  </Link>
                ),
                key,
              })
              setCountConversation((pre) => pre + 1)
            }
            return pre
          })
        })
        chatConnection.on('notification', (notification) => {
          setNewNotification((prev) => {
            const timout = setTimeout(
              () => setNewNotification((prev) => ({ ...prev, show: false })),
              3000,
            )
            if (prev.show) clearTimeout(prev.timeoutId)
            return { show: true, message: notification.message, timeoutId: timout }
          })
          setNotifications((prev) => [notification, ...prev])
          setCountNotification((pre) => pre + 1)
        })
        setHasRegistered(true)
      } catch (err) {
        console.error(err)
      }
    }
  }, [chatConnection, notification, pathname, hasRegistered])

  useEffect(() => {
    if (pathname === '/message') {
      setCountConversation(0)
    }
  }, [pathname])

  useEffect(() => {
    const fetchData = async () => {
      if (chatConnection && chatConnection.state === HubConnectionState.Connected) {
        try {
          const totalUnread = await chatConnection.invoke('TotalUnread')
          setCountConversation(totalUnread)
        } catch (error) {
          console.log(error)
          setCountConversation(0)
        }
        try {
          setNotificationLoading(true)
          const totalUnreadNotification = await chatConnection.invoke('TotalUnreadNotification')
          setCountNotification(totalUnreadNotification)

          const list_notification = await chatConnection.invoke('GetNotification', 1, 10)
          setNotifications(list_notification)
        } catch (error) {
          console.log(error)
          setCountNotification(0)
        } finally {
          setNotificationLoading(false)
        }
      }
    }
    fetchData()
  }, [chatConnection])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('isDarkMode', !darkMode)
  }

  const notificationContent = useMemo(() => {
    const onReadNotification = (id) => {
      if (chatConnection && chatConnection.state === HubConnectionState.Connected) {
        chatConnection.invoke('ReadNotification', id)
        setNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        )
      }
    }

    return notificationLoading ? (
      <div className="space-y-4 w-80">
        {[...new Array(3)].map((_, i) => (
          <Skeleton style={{}} className="w-full" key={i} active paragraph={{ rows: 2 }} />
        ))}
      </div>
    ) : (
      <ConfigProvider renderEmpty={() => <Empty description="Chưa có thông báo" />}>
        <List
          className="w-80 max-h-[70vh] overflow-y-auto"
          size="large"
          dataSource={notifications}
          renderItem={(item) =>
            !item.isRead ? (
              <List.Item
                onClick={() => !item.isRead && onReadNotification(item.id)}
                extra={<Button type="link">Xóa</Button>}
                className="cursor-pointer bg-slate-100"
                style={{ padding: '0.5rem 0 0.5rem 1rem' }}
              >
                <Badge dot>
                  <div className="text-sm">{item.message}</div>
                  <div className="text-[0.65rem] mt-2 text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </div>
                </Badge>
              </List.Item>
            ) : (
              <List.Item
                extra={state.roles?.includes(AdminRole) && <Button type="link">Xóa</Button>}
                className="cursor-pointer"
                style={{ padding: '0.5rem 0 0.5rem 1rem' }}
              >
                <div>
                  <div>{item.message}</div>
                  <div className="text-[0.65rem] mt-2 text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
              </List.Item>
            )
          }
        />
      </ConfigProvider>
    )
  }, [notificationLoading, notifications, chatConnection, state.roles])

  const headerNotification = useMemo(() => {
    const onReadAll = () => {
      if (chatConnection && chatConnection.state === HubConnectionState.Connected) {
        chatConnection.invoke('ReadAllNotification')
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
        setCountNotification(0)
      }
    }
    const onDeleteAll = async () => {
      if (chatConnection && chatConnection.state === HubConnectionState.Connected) {
        await chatConnection.invoke('DeleteAllNotification')
        setNotifications((prev) => prev.filter((e) => !e.isRead))
      }
    }
    return (
      <div className="flex items-center justify-between p-2 bg-gray-200">
        <div>
          <Badge dot={countNotification > 0}>
            <NotificationOutlined />
          </Badge>
          <span className="ml-1">Trung tâm thông báo</span>
        </div>
        <div>
          <Tooltip title="Đánh dấu tất cả là đã đọc">
            <Button onClick={onReadAll} type="link" className="px-2">
              <RiCheckDoubleFill className="text-lg" />
            </Button>
          </Tooltip>
          {state.roles?.includes(AdminRole) && (
            <Tooltip title="Xóa tất cả thông báo đã đọc">
              <Popconfirm title="Xác nhận xóa tất cả" onConfirm={onDeleteAll}>
                <Button type="link" className="px-2">
                  <DeleteOutlined className="text-lg text-red-500" />
                </Button>
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      </div>
    )
  }, [chatConnection, countNotification, state.roles])

  return (
    <>
      <nav className="bg-slate-100 shadow sticky top-0 z-20 dark:border-black dark:bg-black">
        <div className="px-2 h-20 flex justify-end md:justify-between flex-nowrap items-center">
          <div
            className="hidden md:block border py-1 px-3 rounded-md text-base cursor-pointer dark:text-slate-300"
            onClick={toggleCollapsed}
          >
            {sessionStorage.getItem('collapsed') === 'true' || collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )}
          </div>

          <div className="flex gap-3 shrink-0">
            <Popover title={headerNotification} trigger="click" content={notificationContent}>
              <Badge count={countNotification} className="select-none border rounded-lg">
                <Popover
                  placement="left"
                  content={<div className="w-80 line-clamp-2">{newNotification.message}</div>}
                  trigger="click"
                  open={newNotification.show}
                >
                  <Avatar
                    icon={<BellTwoTone />}
                    className="bg-white hover:bg-gray-200 cursor-pointer"
                    shape="square"
                    size="large"
                  />
                </Popover>
              </Badge>
            </Popover>

            <Link to="/message">
              <Badge count={countConversation} className="select-none border rounded-lg">
                <Avatar
                  className="bg-white hover:bg-gray-200 cursor-pointer"
                  icon={<MessageTwoTone />}
                  shape="square"
                  size="large"
                />
              </Badge>
            </Link>
            <div onClick={toggleDarkMode} className="select-none border rounded-lg">
              <Avatar
                className="bg-white text-gray-700 hover:bg-gray-200 cursor-pointer"
                icon={darkMode ? <SunFilled /> : <MoonFilled />}
                shape="square"
                size="large"
              />
            </div>
            {state.isAuthenticated ? (
              <Popconfirm title="Xác nhận đăng xuất?" onConfirm={handleOk}>
                {/* <div className="flex items-center cursor-pointer space-x-2">
                  <img className="w-8 h-8 rounded-full ring-1" src={logo} alt="user" />
                  <div className="w-16 sm:w-full">
                    <span className="block text-sm text-gray-900 truncate dark:text-white">
                      {user.fullName}
                    </span>
                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div> */}
                <Button type="primary" size="large" danger>
                  Đăng xuất
                </Button>
              </Popconfirm>
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
