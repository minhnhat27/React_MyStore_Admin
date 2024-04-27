import axios from 'axios'
import { authHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/upload'

const upload = async (data) => axios.post(API_URL + '/product', data, authHeader())

const uploadService = {
  upload,
}
export default uploadService
