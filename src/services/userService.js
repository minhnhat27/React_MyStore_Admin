import axios from 'axios'
import { authHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/users'

const getAll = async (page, pageSize, keySearch) =>
  await axios.get(
    API_URL + `/getAllUsers?page=${page}&pageSize=${pageSize}&key=${keySearch ?? ''}`,
    { headers: authHeader() },
  )

const lockOut = async (data) =>
  await axios.put(API_URL + '/lockOut', data, { headers: authHeader() })

const userService = {
  getAll,
  lockOut,
}
export default userService
