import { reducer, initialState } from './services/authReducer'
import { GenerateRoutes, privateRoutes, publicRoutes } from './services/routes'
import NotFound from './components/NotFound'

import { createContext, useContext, useReducer, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { Spin } from 'antd'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <GoogleOAuthProvider clientId="85520695235-bavt8f6eq4e6v8hg0ad9v67im7fkm2mt.apps.googleusercontent.com">
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        <AuthContext.Provider value={{ state, dispatch }}>
          <Router>
            <div className="App">
              <ReactNotifications />
              <Spin spinning={isLoading} fullscreen />
              <Routes>
                {GenerateRoutes(publicRoutes)}
                {state.isAuthenticated && GenerateRoutes(privateRoutes)}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthContext.Provider>
      </LoadingContext.Provider>
    </GoogleOAuthProvider>
  )
}
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const LoadingContext = createContext()
export const useLoading = () => useContext(LoadingContext)

export default App
