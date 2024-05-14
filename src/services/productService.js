import axios from 'axios'
import { authHeader, authMediaHeader } from './authHeader'

const API_URL = 'https://localhost:7002/api/admin/products'

const getProducts = async () => axios.get(API_URL + '/getProducts', { headers: authHeader() })
const getProduct = async (id) => axios.get(API_URL + `/getProduct/${id}`, { headers: authHeader() })
const createProduct = async (data) =>
  axios.post(API_URL + '/createProduct', data, { headers: authMediaHeader() })
const updateProduct = async (data) =>
  axios.put(API_URL + '/updateProduct', data, { headers: authMediaHeader() })
const updateProductEnable = async (data) =>
  axios.put(API_URL + '/updateProductEnable', data, { headers: authHeader() })
const deleteProduct = async (id) =>
  axios.delete(API_URL + `/deleteProduct/${id}`, { headers: authHeader() })

const getBrands = async () => axios.get(API_URL + '/getBrands', { headers: authHeader() })
const getBrandNames = async () => axios.get(API_URL + '/getBrandNames', { headers: authHeader() })
const addBrand = async (data) =>
  axios.post(API_URL + '/addBrand', data, { headers: authMediaHeader() })
const deleteBrand = async (id) =>
  axios.delete(API_URL + `/deleteBrand/${id}`, { headers: authHeader() })

const getCategories = async () => axios.get(API_URL + '/getCategories', { headers: authHeader() })
const addCategory = async (data) =>
  axios.post(API_URL + '/addCategory', data, { headers: authHeader() })
const deleteCategory = async (id) =>
  axios.delete(API_URL + `/deleteCategory/${id}`, { headers: authHeader() })

const getMaterials = async () => axios.get(API_URL + '/getMaterials', { headers: authHeader() })
const addMaterial = async (data) =>
  axios.post(API_URL + '/addMaterial', data, { headers: authHeader() })
const deleteMaterial = async (id) =>
  axios.delete(API_URL + `/deleteMaterial/${id}`, { headers: authHeader() })

const getSizes = async () => axios.get(API_URL + '/getSizes', { headers: authHeader() })
const addSize = async (data) => axios.post(API_URL + '/addSize', data, { headers: authHeader() })
const deleteSize = async (id) =>
  axios.delete(API_URL + `/deleteSize/${id}`, { headers: authHeader() })

const fetchProductAttributes = async () => {
  try {
    const brands = await productService.getBrandNames()
    const categories = await productService.getCategories()
    const materials = await productService.getMaterials()
    const sizes = await productService.getSizes()
    const data = {
      brands: brands.data,
      categories: categories.data,
      materials: materials.data,
      sizes: sizes.data,
    }
    return data
  } catch (error) {
    // if (retryCount < process.env.REACT_APP_MAX_RETRY_COUNT) {
    //   setTimeout(() => fetchData(retryCount + 1), 3000)
    //   console.log('reconnect')
    // } else {
    //   console.error('Max retry count exceeded. Unable to fetch data.')
    // }
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
