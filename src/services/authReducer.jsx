import authService from './authService'

const user = authService.getCurrentUser()

export const initialState = {
  isAuthenticated: user !== undefined,
}
export const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
      }

    default:
      return state
  }
}
