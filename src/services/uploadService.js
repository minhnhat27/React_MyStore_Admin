import axios from 'axios'
import { authHeader } from './authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/upload'

const upload = async (data) => await axios.post(API_URL + '/create', data, authHeader())

const uploadService = {
  upload,
}
export default uploadService
