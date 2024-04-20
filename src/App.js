import { reducer, initialState } from './services/authReducer'
import { GenerateRoutes, privateRoutes, publicRoutes } from './services/routes'
import NotFound from './components/NotFound'

import { createContext, useContext, useReducer } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GoogleOAuthProvider clientId="85520695235-bavt8f6eq4e6v8hg0ad9v67im7fkm2mt.apps.googleusercontent.com">
      <AuthContext.Provider value={{ state, dispatch }}>
        <Router>
          <div className="App">
            <ReactNotifications />
            <Routes>
              {GenerateRoutes(publicRoutes)}
              {state.isAuthenticated && GenerateRoutes(privateRoutes)}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  )
}
const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export default App
