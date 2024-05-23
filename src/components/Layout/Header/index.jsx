import Tippy from '@tippyjs/react/headless'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../App'
import authActions from '../../../services/authAction'

import logo from '../../../logo.png'
import authService from '../../../services/authService'
import { Avatar, Badge, Button } from 'antd'
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

  const logout = () => {
    authService.logout()
    dispatch(authActions.LOGOUT)
    navigate('/login')
  }

  return (
    <>
      <nav className="bg-white sticky top-0 z-20 border-b border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl px-2 space-x-2 h-20 flex flex-nowrap items-center justify-between">
          <Button
            type="text"
            className="flex items-center justify-center text-lg"
            onClick={toggleCollapsed}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>

          <div className="flex end-0 items-center shrink-0 md:order-2 space-x-2 md:space-x-4 rtl:space-x-reverse">
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
              <Tippy
                interactive
                placement="bottom"
                trigger="click"
                render={(attrs) => (
                  <div
                    {...attrs}
                    tabIndex={-1}
                    className="w-48 z-50 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                  >
                    <ul className="py-2">
                      <li>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          Earnings
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                          Log out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              >
                <div className="flex items-center cursor-pointer">
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                  >
                    <img className="w-8 h-8 rounded-full" src={logo} alt="user" />
                  </button>
                  <div className="px-4 py-3">
                    <span className="block text-sm text-gray-900 dark:text-white">
                      {user.fullName}
                    </span>
                    <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </Tippy>
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
