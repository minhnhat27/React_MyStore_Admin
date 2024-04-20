import { Store } from 'react-notifications-component'
import 'animate.css/animate.min.css'
import 'react-notifications-component/dist/theme.css'

import {
  BsBellFill,
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsExclamationTriangleFill,
  BsInfoCircleFill,
} from 'react-icons/bs'

const customMessage = (icon, message) => (
  <div className="flex items-center">
    <div className="text-4xl">{icon}</div>
    <div className="ml-2">{message}</div>
  </div>
)

const Success = (message) => {
  return Store.addNotification({
    message: customMessage(<BsCheckCircleFill />, message),
    type: 'success',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__flipInX'],
    animationOut: ['animate__animated animate__flipOutX'],
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  })
}

const Danger = (message) => {
  return Store.addNotification({
    type: 'danger',
    message: customMessage(<BsExclamationCircleFill />, message),
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__flipInX'],
    animationOut: ['animate__animated animate__flipOutX'],
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  })
}
const Info = (message) => {
  return Store.addNotification({
    message: customMessage(<BsInfoCircleFill />, message),
    type: 'info',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__flipInX'],
    animationOut: ['animate__animated animate__flipOutX'],
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  })
}

const Warning = (message) => {
  return Store.addNotification({
    message: customMessage(<BsExclamationTriangleFill />, message),
    type: 'warning',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__flipInX'],
    animationOut: ['animate__animated animate__flipOutX'],
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  })
}
const Default = (message) => {
  return Store.addNotification({
    message: customMessage(<BsBellFill />, message),
    type: 'default',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animate__animated animate__flipInX'],
    animationOut: ['animate__animated animate__flipOutX'],
    dismiss: {
      duration: 2000,
      onScreen: true,
      pauseOnHover: true,
    },
  })
}

const notificationService = {
  Success,
  Danger,
  Info,
  Warning,
  Default,
}
export default notificationService
