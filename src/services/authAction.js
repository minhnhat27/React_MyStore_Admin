export const LOGIN = (roles) => ({
  type: 'LOGIN',
  payload: roles,
})

export const LOGOUT = {
  type: 'LOGOUT',
}

const authActions = {
  LOGIN,
  LOGOUT,
}
export default authActions
