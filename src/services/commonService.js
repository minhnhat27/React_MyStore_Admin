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

export const formatDate = (isoDateStr) => {
  const date = new Date(isoDateStr)
  return date.toLocaleString('en-GB')
}

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

// export const toImageSrc = (base64) => `data:image/;base64,${base64}`

const API_IMG = 'https://localhost:7002/images'

export const toProductImageUrl = (url) => API_IMG + `/Products/${url}`
export const toBrandImageUrl = (url) => API_IMG + `/Brands/${url}`

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

export const transformDataToLabelValue = (data) => {
  return data.map((item) => ({
    ...item,
    value: item.id,
    label: item.name,
  }))
}

export const gender = [
  { value: 'Male', text: 'Male' },
  { value: 'Female', text: 'Female' },
  { value: 'Unisex', text: 'Unisex' },
]

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
