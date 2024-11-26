import Cookies from 'js-cookie'
import httpService from './http-service'
import { AdminRole, EmployeeRole } from './const'

const API_URL = process.env.REACT_APP_API_URL + '/api/auth'

const login = async (data) =>
  await httpService.post(API_URL + '/login', data).then((data) => {
    if (!data.roles.some((role) => role === AdminRole || role === EmployeeRole)) {
      throw new Error('Không có quyền truy cập!')
    }
    const expires = new Date(data.expires)
    Cookies.set('voa_store_management', JSON.stringify(data), { expires })
    return data.roles
  })

const loginGoogle = async (token) =>
  await httpService.post(API_URL + '/login/google', { token }).then((data) => {
    if (!data.roles.some((role) => role === AdminRole || role === EmployeeRole)) {
      throw new Error('Không có quyền truy cập!')
    }
    const expires = new Date(data.expires)
    Cookies.set('voa_store_management', JSON.stringify(data), { expires })
    return data.roles
  })

const logout = () => Cookies.remove('voa_store_management')

const getCurrentUser = () => {
  const user = Cookies.get('voa_store_management')
  return user ? JSON.parse(user) : user
}

const authService = {
  login,
  loginGoogle,
  logout,
  getCurrentUser,
}
export default authService
