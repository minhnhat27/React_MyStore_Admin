import axios from 'axios'
import { authHeader } from '../authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/orders'

const getAll = async (page, pageSize, keySearch) =>
  await axios.get(API_URL, {
    headers: authHeader(),
    params: {
      page: page,
      pageSize: pageSize,
      key: keySearch ?? '',
    },
  })

const getOrderDetail = async (id) => await axios.get(API_URL + `/${id}`, { headers: authHeader() })

const orderService = {
  getAll,
  getOrderDetail,
}
export default orderService
