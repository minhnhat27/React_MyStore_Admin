import Tippy from '@tippyjs/react/headless'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../App'
import notificationService from '../../../services/notificationService'
import authActions from '../../../services/authAction'

import logo from '../../../logo.png'
import { BsPersonCircle } from 'react-icons/bs'
import authService from '../../../services/authService'

export default function Header() {
  const { state, dispatch } = useAuth()
  const navigate = useNavigate()

  const logout = () => {
    authService.logout()
    dispatch(authActions.LOGOUT)
    navigate('/login')
    notificationService.Info('Logged out')
  }
  return (
    <>
      <nav className="bg-white sticky top-0 border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl px-2 h-16 flex flex-wrap items-center justify-between mx-auto">
          <Link
            to="https://flowbite.com/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="h-8"
              alt="Flowbite Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Admin
            </span>
          </Link>
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {state.isAuthenticated ? (
              <Tippy
                interactive
                placement="bottom"
                trigger="click"
                render={(attrs) => (
                  <div
                    {...attrs}
                    tabIndex={-1}
                    className="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                  >
                    <div className="px-4 py-3">
                      <span className="block text-sm text-gray-900 dark:text-white">
                        Bonnie Green
                      </span>
                      <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
                        name@flowbite.com
                      </span>
                    </div>
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
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              >
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  <img className="w-8 h-8 rounded-full" src={logo} alt="user" />
                </button>
              </Tippy>
            ) : (
              <button
                type="button"
                className="flex text-sm bg-white rounded-full md:me-0 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                <BsPersonCircle className="w-8 h-8 rounded-full" />
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
