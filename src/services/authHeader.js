import authService from './authService'

export const authHeader = () => {
  const user = authService.getCurrentUser()
  if (user && user.jwt) {
    return {
      Authorization: 'Bearer ' + user.jwt,
    }
  } else return {}
}

export const authMediaHeader = () => {
  const user = authService.getCurrentUser()
  if (user && user.jwt) {
    return {
      Authorization: 'Bearer ' + user.jwt,
      'Content-Type': 'multipart/form-data',
    }
  } else return {}
}
