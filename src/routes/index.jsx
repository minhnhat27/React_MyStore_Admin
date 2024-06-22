import { Route } from 'react-router-dom'
import { Fragment } from 'react'

import DefaultLayout from '../components/Layout/DefaultLayout'
import NotFound from '../components/NotFound'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Products from '../pages/Products'
import Orders from '../pages/Orders/Orders'
import AddProduct from '../pages/Products/AddProduct'
import OrderDetail from '../pages/Orders/OrderDetail'
import Brand from '../pages/ProductAttributes/Brands'
import Category from '../pages/ProductAttributes/Categories'
import Materials from '../pages/ProductAttributes/Materials'
import Sizes from '../pages/ProductAttributes/Sizes'
import ProductDetail from '../pages/Products/ProductDetail'
import Users from '../pages/Users'

import {
  ContainerOutlined,
  LoginOutlined,
  PieChartOutlined,
  UserOutlined,
  ProductOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons'

export const navigateItems = [
  { key: '/', icon: <PieChartOutlined />, label: 'Dashboard' },
  { key: '/orders-management', icon: <ContainerOutlined />, label: 'Orders' },
  { key: '/products-management', icon: <ProductOutlined />, label: 'Products' },
  { key: '/users-management', icon: <UserOutlined />, label: 'Users' },
  {
    key: 'sub1',
    label: 'Product Attributes',
    icon: <DeploymentUnitOutlined />,
    children: [
      { key: '/brands-management', label: 'Brands' },
      { key: '/categories-management', label: 'Categories' },
      { key: '/materials-management', label: 'Materials' },
      { key: '/sizes-management', label: 'Sizes' },
    ],
  },
  { key: '/login', icon: <LoginOutlined />, label: 'Login' },
]

export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },

  { path: '/products-management', component: Products },
  { path: '/products-management/product-detail/:id', component: ProductDetail },
  { path: '/products-management/add-product', component: AddProduct },

  { path: '/users-management', component: Users },

  { path: '/orders-management', component: Orders },
  { path: '/orders-management/order-detail', component: OrderDetail },

  { path: '/brands-management', component: Brand },
  { path: '/categories-management', component: Category },
  { path: '/materials-management', component: Materials },
  { path: '/sizes-management', component: Sizes },

  { path: '*', component: NotFound },
]

export const privateRoutes = []

export const GenerateRoutes = (route) => {
  return route.map((route, index) => {
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
