import axios from 'axios'
import { authHeader } from '../authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/payments'

const getAll = async () => await axios.get(API_URL + '/payment-methods', { headers: authHeader() })

const getPaymentMethodIsActive = async () => await axios.get(API_URL + '/payment-method-is-active')

const orderService = {
  getAll,
  getPaymentMethodIsActive,
}
export default orderService
