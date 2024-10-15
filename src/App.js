import { reducer, initialState } from './services/authReducer'
import { generatePrivateRoutes, generatePublicRoutes } from './routes'

import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { BrowserRouter as Router, Routes } from 'react-router-dom'

import { App as AntdApp, Spin } from 'antd'
import { HubConnectionBuilder } from '@microsoft/signalr'
import authService from './services/authService'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [chatConnection, setChatConnection] = useState()

  useEffect(() => {
    let connection
    const connect = async () => {
      if (state.isAuthenticated) {
        connection = new HubConnectionBuilder()
          .withUrl(process.env.REACT_APP_API_URL + '/chat', {
            accessTokenFactory: () => authService.getCurrentUser()?.accessToken,
          })
          // .configureLogging(LogLevel.None)
          .withAutomaticReconnect()
          .build()

        try {
          await connection.start()
          console.log('SignalR connected')
          setChatConnection(connection)
        } catch (err) {
          console.error('SignalR connection error: ', err)
        }
      }
    }
    connect()
    return () => {
      if (connection) connection.stop()
    }
  }, [state.isAuthenticated])

  return (
    <AntdApp>
      <ChatContext.Provider value={{ chatConnection }}>
        {/* <GoogleOAuthProvider clientId="85520695235-bavt8f6eq4e6v8hg0ad9v67im7fkm2mt.AntdApps.googleusercontent.com"> */}
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
        {/* </GoogleOAuthProvider> */}
      </ChatContext.Provider>
    </AntdApp>
  )
}
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const LoadingContext = createContext()
export const useLoading = () => useContext(LoadingContext)

const ChatContext = createContext()
export const useChat = () => useContext(ChatContext)

export default App
