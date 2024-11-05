import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useChat } from '../../../App'
import authActions from '../../../services/authAction'

import authService from '../../../services/authService'
import { App, Avatar, Badge, Button, Popconfirm } from 'antd'
import {
  UserOutlined,
  MoonFilled,
  SunFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageTwoTone,
} from '@ant-design/icons'
import { useEffect, useLayoutEffect, useState } from 'react'
import { HubConnectionState } from '@microsoft/signalr'

let hasAdminEventRegistered = false

export default function Header({ collapsed, toggleCollapsed }) {
  const { state, dispatch } = useAuth()
  const { chatConnection } = useChat()
  const { notification } = App.useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [pathname, setPathname] = useState(location.pathname)

  const [darkMode, setDarkMode] = useState(false)

  const [count, setCount] = useState(0)

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
    if (
      chatConnection &&
      chatConnection.state === HubConnectionState.Connected &&
      !hasAdminEventRegistered
    ) {
      try {
        chatConnection.on('onAdmin', (connectionId, message) => {
          setPathname((pre) => {
            if (pre !== '/message') {
              const key = `open${Date.now()}`
              notification.info({
                message: (
                  <>
                    <span className="font-semibold">Message: </span>
                    {message}
                  </>
                ),
                btn: (
                  <Link
                    onClick={() => notification.destroy(key)}
                    to={`/message?connectionId=${connectionId}`}
                  >
                    <Button size="small" type="link">
                      Xem ngay
                    </Button>
                  </Link>
                ),
                key,
              })
              setCount((pre) => pre + 1)
            }
            return pre
          })
        })
        hasAdminEventRegistered = true
      } catch (err) {
        console.error(err)
      }
    }
  }, [chatConnection, notification, pathname])

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

  return (
    <>
      <nav className="bg-white sticky top-0 z-20 border-b border-gray-200 dark:border-black dark:bg-black">
        <div className="px-2 h-20 flex flex-nowrap items-center">
          <div
            className="border py-1 px-3 rounded-md text-base cursor-pointer dark:text-slate-300"
            onClick={toggleCollapsed}
          >
            {sessionStorage.getItem('collapsed') === 'true' || collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )}
          </div>

          <div className="flex flex-1 justify-end items-center shrink-0 md:order-2 space-x-4 rtl:space-x-reverse">
            <Link to="/message">
              <Badge count={count} className="select-none border rounded-lg">
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
