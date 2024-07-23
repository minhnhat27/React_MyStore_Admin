import authService from './authService'

export const authHeader = () => {
  const user = authService.getCurrentUser()
  if (user && user.accessToken) {
    return {
      Authorization: 'Bearer ' + user.accessToken,
    }
  } else return {}
}

export const authMediaHeader = () => {
  const user = authService.getCurrentUser()
  if (user && user.accessToken) {
    return {
      Authorization: 'Bearer ' + user.accessToken,
      'Content-Type': 'multipart/form-data',
    }
  } else return {}
}
