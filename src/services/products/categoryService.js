import axios from 'axios'
import { authHeader } from '../authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/categories'

const getAll = async () => await axios.get(API_URL)
const create = async (data) =>
  await axios.post(API_URL + '/create', data, { headers: authHeader() })
const update = async (id, data) =>
  await axios.put(API_URL + `/update/${id}`, data, { headers: authHeader() })
const remove = async (id) =>
  await axios.delete(API_URL + `/delete/${id}`, { headers: authHeader() })

const categoryService = {
  getAll,
  create,
  update,
  remove,
}
export default categoryService
