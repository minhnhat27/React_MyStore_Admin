import authService from './authService'

const user = authService.getCurrentUser()

export const initialState = {
  isAuthenticated: user !== undefined,
  roles: user?.roles,
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        roles: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        roles: undefined,
      }

    default:
      return state
  }
}
