import axios from 'axios'
import { authHeader } from '../authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/account'

const getAll = async (page, pageSize, keySearch) =>
  await axios.get(API_URL, {
    headers: authHeader(),
    params: {
      page: page,
      pageSize: pageSize,
      key: keySearch ?? '',
    },
  })

const lockOut = async (data) =>
  await axios.put(API_URL + '/lock-out', data, { headers: authHeader() })

const userService = {
  getAll,
  lockOut,
}
export default userService
