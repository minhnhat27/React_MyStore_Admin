import axios from 'axios'
import { authHeader, authMediaHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/admin/products'

const getProducts = async (page, pageSize, keySearch) =>
  await axios.get(
    API_URL + `/getProducts?page=${page}&pageSize=${pageSize}&key=${keySearch ?? ''}`,
    {
      headers: authHeader(),
    },
  )
const getProduct = async (id) =>
  await axios.get(API_URL + `/getProduct/${id}`, { headers: authHeader() })
const createProduct = async (data) =>
  await axios.post(API_URL + '/createProduct', data, { headers: authMediaHeader() })
const updateProduct = async (data) =>
  await axios.put(API_URL + '/updateProduct', data, { headers: authMediaHeader() })
const updateProductEnable = async (data) =>
  await axios.put(API_URL + '/updateProductEnable', data, { headers: authHeader() })
const deleteProduct = async (id) =>
  await axios.delete(API_URL + `/deleteProduct/${id}`, { headers: authHeader() })

const getBrands = async () => await axios.get(API_URL + '/getBrands', { headers: authHeader() })
const getBrandNames = async () =>
  await axios.get(API_URL + '/getBrandNames', { headers: authHeader() })
const addBrand = async (data) =>
  await axios.post(API_URL + '/addBrand', data, { headers: authMediaHeader() })
const deleteBrand = async (id) =>
  await axios.delete(API_URL + `/deleteBrand/${id}`, { headers: authHeader() })

const getCategories = async () =>
  await axios.get(API_URL + '/getCategories', { headers: authHeader() })
const addCategory = async (data) =>
  await axios.post(API_URL + '/addCategory', data, { headers: authHeader() })
const deleteCategory = async (id) =>
  await axios.delete(API_URL + `/deleteCategory/${id}`, { headers: authHeader() })

const getMaterials = async () =>
  await axios.get(API_URL + '/getMaterials', { headers: authHeader() })
const addMaterial = async (data) =>
  await axios.post(API_URL + '/addMaterial', data, { headers: authHeader() })
const deleteMaterial = async (id) =>
  await axios.delete(API_URL + `/deleteMaterial/${id}`, { headers: authHeader() })

const getSizes = async () => await axios.get(API_URL + '/getSizes', { headers: authHeader() })
const addSize = async (data) =>
  await axios.post(API_URL + '/addSize', data, { headers: authHeader() })
const deleteSize = async (id) =>
  await axios.delete(API_URL + `/deleteSize/${id}`, { headers: authHeader() })

const fetchProductAttributes = async () => {
  try {
    const brands = await getBrandNames()
    const materials = await getMaterials()
    const sizes = await getSizes()
    const categories = await getCategories()

    const data = {
      brands: brands.data,
      materials: materials.data,
      sizes: sizes.data,
      categories: categories.data,
    }
    return data
  } catch (error) {
    return new Error(error)
  }
}

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductEnable,
  deleteProduct,
  addBrand,
  getBrands,
  getBrandNames,
  deleteBrand,
  getCategories,
  addCategory,
  deleteCategory,
  getMaterials,
  addMaterial,
  deleteMaterial,
  getSizes,
  addSize,
  deleteSize,
  fetchProductAttributes,
}
export default productService
