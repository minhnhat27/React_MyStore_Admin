import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../App'
import authActions from '../../../services/authAction'

import logo from '../../../logo.png'
import authService from '../../../services/authService'
import { Avatar, Badge, Button, Dropdown, Modal } from 'antd'
import {
  UserOutlined,
  MessageTwoTone,
  MoonFilled,
  SunFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'

export default function Header({ collapsed, toggleCollapsed }) {
  const { state, dispatch } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState({})

  const [darkMode, setDarkMode] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => setIsModalOpen(true)

  const handleOk = () => {
    setIsModalOpen(false)
    authService.logout()
    dispatch(authActions.LOGOUT)
    navigate('/')
  }
  const handleCancel = () => setIsModalOpen(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode')
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode) ?? true)
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  useEffect(() => {
    const user = authService.getCurrentUser()
    user ? setUser({ fullName: user.fullName, email: user.email }) : setUser({})
  }, [state.isAuthenticated])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('isDarkMode', !darkMode)
  }

  const items = [
    {
      label: <Link to="/profile">Profile</Link>,
      key: '0',
    },
    {
      label: <Link to="/settings">Settings</Link>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: 'Log out',
      key: '3',
      onClick: showModal,
    },
  ]

  return (
    <>
      <Modal title="Log Out" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>Are you sure you want to log out?</p>
      </Modal>
      <nav className="bg-white sticky top-0 z-20 border-b border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl px-2 space-x-2 h-20 flex flex-nowrap items-center">
          <Button
            type="text"
            className="flex items-center justify-center text-lg"
            onClick={toggleCollapsed}
          >
            {sessionStorage.getItem('collapsed') === 'true' || collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )}
          </Button>

          <div className="flex flex-1 justify-end items-center shrink-0 md:order-2 space-x-2 md:space-x-4 rtl:space-x-reverse">
            <Badge count={10} className="select-none border rounded-lg">
              <Avatar
                className="bg-white hover:bg-gray-200 cursor-pointer"
                icon={<MessageTwoTone />}
                shape="square"
                size="large"
              />
            </Badge>
            <div onClick={toggleDarkMode} className="select-none border rounded-lg">
              <Avatar
                className="bg-white text-gray-700 hover:bg-gray-200 cursor-pointer"
                icon={darkMode ? <SunFilled /> : <MoonFilled />}
                shape="square"
                size="large"
              />
            </div>
            {state.isAuthenticated ? (
              <Dropdown menu={{ items }} trigger={['click']}>
                <div className="flex items-center cursor-pointer space-x-2">
                  <img className="w-8 h-8 rounded-full ring-1" src={logo} alt="user" />
                  <div className="w-16 sm:w-full">
                    <span className="block text-sm text-gray-900 truncate dark:text-white">
                      {user.fullName}
                    </span>
                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
