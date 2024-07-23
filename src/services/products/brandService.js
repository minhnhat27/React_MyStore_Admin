import axios from 'axios'
import { authHeader, authMediaHeader } from '../authHeader'

const API_URL = process.env.REACT_APP_API_URL + '/api/brands'

const getAll = async () => await axios.get(API_URL)
const create = async (data) =>
  await axios.post(API_URL + '/create', data, { headers: authMediaHeader() })
const update = async (id, data) =>
  await axios.put(API_URL + `/update/${id}`, data, { headers: authMediaHeader() })
const remove = async (id) =>
  await axios.delete(API_URL + `/delete/${id}`, { headers: authHeader() })

const brandService = {
  getAll,
  create,
  update,
  remove,
}
export default brandService
