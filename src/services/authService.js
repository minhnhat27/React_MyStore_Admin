import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = 'https://localhost:7002/api/account'

const login = async (data) =>
  await axios.post(API_URL + '/login', data).then((res) => {
    const expires = 12 * 60 * 60 * 1000
    const in12Hour = new Date(new Date().getTime() + expires)
    Cookies.set('user_Data', JSON.stringify(res.data), { expires: in12Hour })
    return res
  })

const sendCode = async (data) => await axios.post(API_URL + '/sendCode', data)

const register = async (data) => await axios.post(API_URL + '/register', data)

const logout = () => Cookies.remove('user_Data')

const getCurrentUser = () => {
  const user = Cookies.get('user_Data')
  return user ? JSON.parse(user) : user
}

const loginGoogle = async (data) =>
  await axios.post(API_URL + '/loginGoogle', data).then((res) => {
    const expires = 12 * 60 * 60 * 1000
    const in12Hour = new Date(new Date().getTime() + expires)
    Cookies.set('user_Data', JSON.stringify(res.data), { expires: in12Hour })
    return res
  })

const authService = {
  login,
  register,
  logout,
  sendCode,
  getCurrentUser,
  loginGoogle,
}
export default authService
