const API_URL = process.env.REACT_APP_API_URL

export const debounce = (func, delay) => {
  let timeout
  return function (...args) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, delay)
  }
}

export const formatVND = new Intl.NumberFormat('vi', {
  style: 'currency',
  currency: 'VND',
})

export const formatUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const isEmptyObject = (obj) => {
  return JSON.stringify(obj) === '{}'
}

export const formatDate = (isoDateStr) => new Date(isoDateStr).toLocaleString('en-GB')

export const toImageSrc = (url) => API_URL + '/' + url

export const showError = (err) => err.response?.data?.title || err.response?.data || err.message

export const toTextLabel = (data) => {
  return data.map((item) => ({
    ...item,
    value: item.id,
    label: item.name,
  }))
}

export const toTextValue = (data) => {
  return data.map((value) => ({
    ...value,
    value: value,
    text: value,
  }))
}

export const gender = [
  { value: 0, label: 'Nam' },
  { value: 1, label: 'Nữ' },
  { value: 2, label: 'Unisex' },
]

// export const sizes = [
//   { value: 'XS', label: 'XS' },
//   { value: 'S', label: 'S' },
//   { value: 'M', label: 'M' },
//   { value: 'L', label: 'L' },
//   { value: 'XL', label: 'XL' },
//   { value: 'XXL', label: 'XXL' },
//   { value: 'XXXL', label: 'XXXL' },
// ]

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

export const getFileFromUrl = async (url, filename) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const f = filename.split('.')

    return new File([blob], f[0], { type: f[1] })
  } catch (error) {
    console.error('Error fetch image:', error)
    return null
  }
}

export function base64toFile(dataurl, filename) {
  dataurl = `data:image/;base64,${dataurl}`
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}
