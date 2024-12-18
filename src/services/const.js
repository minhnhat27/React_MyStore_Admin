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
export const STATISTICS_API = base + '/statistics'
export const FLASHSALES_API = base + '/flashsales'

export const Gender = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Unisex',
}

export const RequiredNote = {
  0: 'Cho thử hàng',
  1: 'Cho xem hàng không thử',
  2: 'Không cho xem hàng',
}

export const Roles = {
  Admin: 'Quản trị',
  Employee: 'Nhân viên',
  User: 'Khách hàng',
}
export const UserRole = 'User'
export const AdminRole = 'Admin'
export const EmployeeRole = 'Employee'

// export const OrderStatus = {
//   0: 'Đang xử lý',
//   1: 'Đã xác nhận',
//   2: 'Chờ lấy hàng',
//   3: 'Đang vận chuyển',
//   4: 'Đang giao hàng',
//   5: 'Đã nhận hàng',
//   6: 'Đã hủy',
//   7: 'Tất cả',
// }

export const OrderStatus = {
  0: 'Đang xử lý',
  1: 'Đã xác nhận',
  2: 'Đang vận chuyển',
  3: 'Đã nhận hàng',
  4: 'Đã hủy',
  5: 'Tất cả',
}

export const ProcessingStatus = 0
export const ConfirmedStatus = 1
export const ShippingStatus = 2
export const ReceivedStatus = 3
export const CancelStatus = 4
export const AllStatus = 5

export const OrderStatusTagColor = {
  0: '#eab308',
  1: '#3b82f6',
  // 2: '#14b8a6',
  2: '#a855f7',
  // 4: '#f97316',
  3: '#22c55e',
  4: '#f43f5e', //"#ef4444"
}
