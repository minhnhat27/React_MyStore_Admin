import authService from './authService'

export const authHeader = () => {
  const userToken = authService.getCurrentUser()
  if (userToken) {
    return {
      Authorization: 'Bearer ' + userToken,
    }
  } else return {}
}

export const authMediaHeader = () => {
  const userToken = authService.getCurrentUser()
  if (userToken) {
    return {
      Authorization: 'Bearer ' + userToken,
      'Content-Type': 'multipart/form-data',
    }
  } else return {}
}
