import axios from 'axios'
import { authHeader, authMediaHeader } from './authHeader'

const get = (url) => axios.get(url, { headers: authHeader() }).then((res) => res.data)

const getWithAuthMediaHeader = (url) =>
  axios.get(url, { headers: authMediaHeader() }).then((res) => res.data)

const getWithParams = (url, params) =>
  axios
    .get(url, { params: params, paramsSerializer: { indexes: true }, headers: authHeader() })
    .then((res) => res.data)

const post = (url, data) => axios.post(url, data, { headers: authHeader() }).then((res) => res.data)

const put = (url, data) => axios.put(url, data, { headers: authHeader() }).then((res) => res.data)

const del = (url) => axios.delete(url, { headers: authHeader() })

const httpService = {
  get,
  getWithAuthMediaHeader,
  getWithParams,
  post,
  put,
  del,
}
export default httpService
