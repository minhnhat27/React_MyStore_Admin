import axios from 'axios'
import { authHeader, authMediaHeader } from '../authHeader'
import brandService from './brandService'
import materialService from './materialService'
import categoryService from './categoryService'

const API_URL = process.env.REACT_APP_API_URL + '/api/products'

const getAll = async (page, pageSize, keySearch) =>
  await axios.get(API_URL, {
    params: {
      page: page,
      pageSize: pageSize,
      key: keySearch ?? '',
    },
  })
const getProduct = async (id) => await axios.get(API_URL + `/getProduct/${id}`)
const create = async (data) =>
  await axios.post(API_URL + '/create', data, { headers: authMediaHeader() })
const update = async (id, data) =>
  await axios.put(API_URL + `/update/${id}`, data, { headers: authMediaHeader() })
const updateEnable = async (id, data) =>
  await axios.put(API_URL + `/updateEnable/${id}`, data, { headers: authHeader() })
const remove = async (id) =>
  await axios.delete(API_URL + `/delete/${id}`, { headers: authHeader() })

const fetchProductAttributes = async () => {
  try {
    const brands = await brandService.getAll()
    const materials = await materialService.getAll()
    const categories = await categoryService.getAll()
    const data = {
      brands: brands.data,
      materials: materials.data,
      categories: categories.data,
    }
    return data
  } catch (error) {
    return new Error(error)
  }
}

const productService = {
  getAll,
  getProduct,
  create,
  update,
  updateEnable,
  remove,
  fetchProductAttributes,
}
export default productService