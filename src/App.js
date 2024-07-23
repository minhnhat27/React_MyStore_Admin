import { reducer, initialState } from './services/authReducer'
import { generatePrivateRoutes, generatePublicRoutes } from './routes'

import { createContext, useContext, useReducer, useState } from 'react'
import { BrowserRouter as Router, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { message, notification, Spin } from 'antd'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [showMessage, messageContextHolder] = message.useMessage()
  const [showNotification, notificationContextHolder] = notification.useNotification()

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {notificationContextHolder}
      <MessageContext.Provider value={{ showMessage }}>
        {messageContextHolder}
        <GoogleOAuthProvider clientId="85520695235-bavt8f6eq4e6v8hg0ad9v67im7fkm2mt.apps.googleusercontent.com">
          <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            <AuthContext.Provider value={{ state, dispatch }}>
              <Router>
                <Spin spinning={isLoading} fullscreen />
                <Routes>
                  {generatePublicRoutes(state.isAuthenticated)}
                  {generatePrivateRoutes(state.isAuthenticated)}
                </Routes>
              </Router>
            </AuthContext.Provider>
          </LoadingContext.Provider>
        </GoogleOAuthProvider>
      </MessageContext.Provider>
    </NotificationContext.Provider>
  )
}
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const LoadingContext = createContext()
export const useLoading = () => useContext(LoadingContext)

const MessageContext = createContext()
export const useAntdMessage = () => useContext(MessageContext)

const NotificationContext = createContext()
export const useAntdNotification = () => useContext(NotificationContext)

export default App
