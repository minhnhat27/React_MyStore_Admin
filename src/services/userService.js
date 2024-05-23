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

  // // Lấy các thành phần ngày giờ
  // const day = String(date.getDate()).padStart(2, '0')
  // const month = String(date.getMonth() + 1).padStart(2, '0') // Tháng trong Date bắt đầu từ 0
  // const year = date.getFullYear()

  // const hours = String(date.getHours()).padStart(2, '0')
  // const minutes = String(date.getMinutes()).padStart(2, '0')
  // const seconds = String(date.getSeconds()).padStart(2, '0')

  // // Định dạng lại chuỗi ngày giờ
  // return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

export const toImageSrc = (base64) => `data:image/;base64,${base64}`

export const transformDataToLabelValue = (data) => {
  return data.map((item) => ({
    ...item,
    value: item.id,
    label: item.name,
  }))
}

export const gender = [{ value: 'Male' }, { value: 'Female' }, { value: 'Unisex' }]

export function base64toFile(dataurl, filename) {
  dataurl = toImageSrc(dataurl)
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
