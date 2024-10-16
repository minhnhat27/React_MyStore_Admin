const base = process.env.REACT_APP_API_URL + '/api'

export const HOME_API = base + '/home'
export const CART_API = base + '/cart'
export const PRODUCT_API = base + '/products'
export const BRAND_API = base + '/brands'
export const MATERIAL_API = base + '/materials'
export const CATEGORY_API = base + '/categories'
export const SIZE_API = base + '/sizes'
export const AUTH_API = base + '/auth'
export const IMAGE_API = base + '/images'
export const PROFILE_API = base + '/images'
export const VOUCHER_API = base + '/vouchers'
export const PAYMENT_API = base + '/payments'
export const ORDER_API = base + '/orders'
export const ACCOUNT_API = base + '/account'

export const Gender = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Unisex',
}

export const OrderStatus = {
  0: 'Đang xử lý',
  1: 'Đã xác nhận',
  2: 'Chờ lấy hàng',
  3: 'Đang vận chuyển',
  4: 'Đang giao hàng',
  5: 'Đã nhận hàng',
  6: 'Đã hủy',
}

export const ProcessingStatus = 0
export const ConfirmedStatus = 1

export const CancelStatus = 6
export const ReceivedStatus = 5
