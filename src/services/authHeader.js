import authService from './authService'

export default function authHeader() {
  const userToken = authService.getCurrentUser()
  if (userToken) {
    return {
      Authorization: 'Bearer ' + user.accessToken,
    }
  } else return {}
}
