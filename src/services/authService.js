import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.REACT_APP_API_URL + '/api/auth'

const login = async (data) =>
  await axios.post(API_URL + '/login', data).then((res) => {
    const expires = 12 * 60 * 60 * 1000
    const in12Hour = new Date(new Date().getTime() + expires)
    Cookies.set('nstore_data', JSON.stringify(res.data), { expires: in12Hour })
    return res
  })

const sendCode = async (data) => await axios.post(API_URL + '/send-code', data)

const register = async (data) => await axios.post(API_URL + '/register', data)

const logout = () => Cookies.remove('nstore_data')

const getCurrentUser = () => {
  const user = Cookies.get('nstore_data')
  return user ? JSON.parse(user) : user
}

const loginGoogle = async (data) =>
  await axios.post(API_URL + '/login-google', data).then((res) => {
    const expires = 12 * 60 * 60 * 1000
    const in12Hour = new Date(new Date().getTime() + expires)
    Cookies.set('nstore_data', JSON.stringify(res.data), { expires: in12Hour })
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
