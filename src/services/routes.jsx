import { Route } from 'react-router-dom'
import { Fragment } from 'react'

import DefaultLayout from '../components/Layout/DefaultLayout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Products from '../pages/Products'

export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/products-managment', component: Products },
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
