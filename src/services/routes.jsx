import { Route } from 'react-router-dom'
import { Fragment } from 'react'

import DefaultLayout from '../components/Layout/DefaultLayout'
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

export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },

  { path: '/products-managment', component: Products },
  { path: '/products-managment/product-detail', component: ProductDetail },
  { path: '/products-managment/add-product', component: AddProduct },

  { path: '/users-managment', component: Users },

  { path: '/orders-managment', component: Orders },
  { path: '/orders-managment/order-detail', component: OrderDetail },

  { path: '/brands-managment', component: Brand },
  { path: '/categories-managment', component: Category },
  { path: '/materials-managment', component: Materials },
  { path: '/sizes-managment', component: Sizes },
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
