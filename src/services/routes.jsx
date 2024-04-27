import { Route } from 'react-router-dom'
import { Fragment } from 'react'

import DefaultLayout from '../components/Layout/DefaultLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Products from '../pages/Products'
import Orders from '../pages/Orders'
import AddProduct from '../pages/Products/AddProduct'
import OrderDetail from '../pages/Orders/OrderDetail'

export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },

  { path: '/products-managment', component: Products },
  { path: '/products-managment/add-product', component: AddProduct },
  { path: '/orders-managment', component: Orders },
  { path: '/orders-managment/order-detail', component: OrderDetail },
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
