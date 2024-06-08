import axios from 'axios'
import { authHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/orders'

const getOrders = async (page, pageSize, keySearch) =>
  await axios.get(API_URL + `/getOrders?page=${page}&pageSize=${pageSize}&key=${keySearch ?? ''}`, {
    headers: authHeader(),
  })

const getPaymentMethods = async () => await axios.get(API_URL + '/getPaymentMethods')

const orderService = {
  getOrders,
  getPaymentMethods,
}
export default orderService
