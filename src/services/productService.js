import axios from 'axios'
import { authMediaHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/admin/products'

const createProduct = async (data) => axios.post(API_URL + '/create', data, authMediaHeader())

const productService = {
  createProduct,
}
export default productService
