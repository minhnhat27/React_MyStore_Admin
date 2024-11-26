import { Navigate, Route } from 'react-router-dom'
import { Fragment } from 'react'

import {
  ContainerOutlined,
  PieChartOutlined,
  UserOutlined,
  ProductOutlined,
  DeploymentUnitOutlined,
  MessageFilled,
  GiftOutlined,
  FireOutlined,
} from '@ant-design/icons'

import DefaultLayout from '../components/Layout/DefaultLayout'
import NotFound from '../components/NotFound'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Products from '../pages/Products'
import Orders from '../pages/Orders'
import AddProduct from '../pages/Products/AddProduct'
import Brand from '../pages/ProductAttributes/Brands'
import Category from '../pages/ProductAttributes/Categories'
import Materials from '../pages/ProductAttributes/Materials'
import ProductDetail from '../pages/Products/ProductDetail'
import Users from '../pages/Users'
import Message from '../pages/Chat'
import Sizes from '../pages/ProductAttributes/Sizes'
import Payments from '../pages/Payments'
import Vouchers from '../pages/Vouchers'
import FlashSales from '../pages/FlashSales'
import { AdminRole, EmployeeRole } from '../services/const'

export const navigateItemsAdmin = [
  { key: '/home', icon: <PieChartOutlined />, label: 'Trang chủ' },
  { key: '/orders-management', icon: <ContainerOutlined />, label: 'Đơn hàng' },
  { key: '/products-management', icon: <ProductOutlined />, label: 'Sản phẩm' },
  { key: '/flashsales-management', icon: <FireOutlined />, label: 'Chiến dịch Flash Sale' },
  { key: '/vouchers-management', icon: <GiftOutlined />, label: 'Mã giảm giá' },
  {
    key: '/message',
    icon: <MessageFilled />,
    label: 'Trò chuyện',
  },
  { key: '/users-management', icon: <UserOutlined />, label: 'Người dùng' },
  { key: '/payments-management', icon: <ContainerOutlined />, label: 'Thanh toán' },
  {
    key: 'sub1',
    label: 'Thuộc tính sản phẩm',
    icon: <DeploymentUnitOutlined />,
    children: [
      { key: '/brands-management', label: 'Thương hiệu' },
      { key: '/categories-management', label: 'Danh mục' },
      { key: '/materials-management', label: 'Chất liệu' },
      { key: '/sizes-management', label: 'Kích cỡ' },
    ],
  },
]

export const navigateItemsEmployee = [
  { key: '/home', icon: <PieChartOutlined />, label: 'Trang chủ' },
  { key: '/orders-management', icon: <ContainerOutlined />, label: 'Đơn hàng' },
  { key: '/products-management', icon: <ProductOutlined />, label: 'Sản phẩm' },
  { key: '/flashsales-management', icon: <FireOutlined />, label: 'Chiến dịch Flash Sale' },
  {
    key: '/message',
    icon: <MessageFilled />,
    label: 'Trò chuyện',
  },
  { key: '/payments-management', icon: <ContainerOutlined />, label: 'Thanh toán' },
]

export const publicRoutes = [
  { path: '/', component: Login, layout: null },
  { path: '*', component: NotFound, layout: null },
]

const adminRoute = [
  { path: '/home', component: Home },
  { path: '/message', component: Message },
  { path: '/products-management', component: Products },
  { path: '/products-management/product-detail/:id', component: ProductDetail },
  { path: '/products-management/add-product', component: AddProduct },

  { path: '/users-management', component: Users },
  { path: '/vouchers-management', component: Vouchers },
  { path: '/flashsales-management', component: FlashSales },

  { path: '/orders-management', component: Orders },
  { path: '/payments-management', component: Payments },

  { path: '/brands-management', component: Brand },
  { path: '/categories-management', component: Category },
  { path: '/materials-management', component: Materials },
  { path: '/sizes-management', component: Sizes },
]
const employeeRoute = [
  { path: '/home', component: Home },
  { path: '/message', component: Message },
  { path: '/products-management', component: Products },
  { path: '/products-management/product-detail/:id', component: ProductDetail },
  { path: '/products-management/add-product', component: AddProduct },

  { path: '/flashsales-management', component: FlashSales },

  { path: '/orders-management', component: Orders },
  { path: '/payments-management', component: Payments },
]

export const generatePublicRoutes = (state) => {
  return publicRoutes.map((route, index) => {
    const Page = route.component
    let Layout = DefaultLayout

    if (route.layout) {
      Layout = route.layout
    } else if (route.layout === null) {
      Layout = Fragment
    }
    if (state.isAuthenticated && route.path === '/') {
      return <Route key={index} path={route.path} element={<Navigate to="/home" />} />
    }
    return (
      <Route
        key={index}
        path={route.path}
        element={
          <Layout>
            <Page />
          </Layout>
        }
      />
    )
  })
}

export const generatePrivateRoutes = (state) => {
  if (state.isAuthenticated) {
    if (state.roles && state.roles.includes(AdminRole)) {
      return adminRoute.map((route, index) => {
        const Page = route.component
        let Layout = DefaultLayout

        if (route.layout) {
          Layout = route.layout
        } else if (route.layout === null) {
          Layout = Fragment
        }
        return (
          <Route
            key={index}
            path={route.path}
            element={
              <Layout>
                <Page />
              </Layout>
            }
          />
        )
      })
    } else if (state.roles && state.roles.includes(EmployeeRole)) {
      return employeeRoute.map((route, index) => {
        const Page = route.component
        let Layout = DefaultLayout

        if (route.layout) {
          Layout = route.layout
        } else if (route.layout === null) {
          Layout = Fragment
        }
        return (
          <Route
            key={index}
            path={route.path}
            element={
              <Layout>
                <Page />
              </Layout>
            }
          />
        )
      })
    }
  } else {
    return adminRoute.map((route, index) => (
      <Route key={index} path={route.path} element={<Navigate to="/" />} />
    ))
  }
}
