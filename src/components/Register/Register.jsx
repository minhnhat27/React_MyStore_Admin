import Button from '../UI/Button'
import Input from '../UI/Input'
import InsideLoading from '../Loading/InsideLoading'

import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import authService from '../../services/authService'

export default function Register({ toggleSignIn, setRegSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)

  const [disabledSend, setDisabledSend] = useState(true)
  const [disabledVerify, setDisabledVerify] = useState(true)
  const [disabledRegister, setDisabledRegister] = useState(true)

  const [labelSend, setLabelSend] = useState('Send')
  const [intervals, setIntervals] = useState([])

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()

  const handleSubmitRegister = () => {
    setLoading(true)
    authService
      .register(getValues())
      .then(() => {
        setLoading(false)
        toggleSignIn()
        setRegSuccess(true)
      })
      .catch(({ response }) => {
        setLoading(false)
        switch (response.status) {
          case 409:
            setError('email', { message: 'User already exists' })
            break
          case 411:
            setError('password', {
              message:
                'Minimum 6 characters at least 1 uppercase letter, 1 lowercase letter and 1 number',
            })
            break
          case 417:
            setError('verifyCode', { message: 'Verify code incorrect' })
            break
          default:
            setError('verifyCode', { message: 'An error occurred. Please try again' })
        }
      })
  }

  const handleSendCode = () => {
    setSendLoading(true)
    authService
      .sendCode({ id: getValues('email') })
      .then(() => {
        setError('verifyCode', { message: 'Please check your email.' })
        setDisabledVerify(false)
        setDisabledSend(true)

        let time = 59
        intervals.forEach(clearInterval)

        const timer = setInterval(() => {
          setLabelSend('Resend ' + time)
          time -= 1
          if (time === 0) {
            setDisabledSend(false)
            clearInterval(timer)
            setLabelSend('Resend')
          }
        }, 1000)
        setIntervals((prevTimer) => [...prevTimer, timer])
        setSendLoading(false)
      })
      .catch(({ response }) => {
        setSendLoading(false)
        switch (response.status) {
          case 409:
            setError('email', { message: 'User already exists' })
            break
          default:
            setError('password', { message: 'An error occurred. Please try again' })
        }
      })
  }

  return (
    <>
      <p className="text-center font-bold text-xl">N Store Register</p>
      <form method="POST" onSubmit={handleSubmit(handleSubmitRegister)}>
        <div className="my-3">
          <Input
            type="text"
            name="name"
            className="w-full p-2 border rounded-md focus:outline-blue-500"
            placeholder="Your Name"
            id="name"
            {...register('name', { required: 'Name is required' })}
          />
          <span className="text-red-500">{errors.name && errors.name.message}</span>
        </div>
        <div className="my-3">
          <Input
            type="email"
            name="email"
            className="w-full p-2 border rounded-md focus:outline-blue-500"
            placeholder="Email"
            id="email"
            {...register('email', {
              required: 'Email is required',
              onChange: (e) => {
                setDisabledSend(false)
                clearErrors('email')
                if (e.target.value === '') setDisabledSend(true)
              },
            })}
          />
          <span className="text-red-500">{errors.email && errors.email.message}</span>
        </div>
        <div className="my-3">
          <div className="flex">
            <Input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-2 border rounded-md focus:outline-blue-500"
              placeholder="Password"
              name="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                onChange: () => {
                  clearErrors('password')
                },
              })}
            />
            <div
              onClick={handleShowPassword}
              className="flex justify-around items-center cursor-pointer"
            >
              {showPassword ? (
                <BsEyeSlash className="absolute mr-10" size={20} />
              ) : (
                <BsEye className="absolute mr-10" size={20} />
              )}
            </div>
          </div>
          <span className="text-red-500">{errors.password && errors.password.message}</span>
        </div>
        <div className="my-3">
          <div className="flex relative">
            <Input
              disabled={disabledVerify}
              type="number"
              name="verification"
              className="w-full p-2 border rounded-md focus:outline-offset-2 focus:outline-blue-500"
              placeholder="Verify Code"
              id="verification"
              {...register('verifyCode', {
                required: 'Verify code is required',
                onChange: () => {
                  clearErrors('verifyCode')
                  setDisabledRegister(false)
                },
              })}
            />
            <Button
              disabled={disabledSend || sendLoading}
              onClick={handleSendCode}
              type="button"
              className={`${
                disabledSend ? 'bg-emerald-400' : 'bg-emerald-500 hover:bg-emerald-600'
              } absolute right-0 rounded-md h-full w-fit px-3 text-white font-semibold`}
            >
              {sendLoading ? <InsideLoading /> : labelSend}
            </Button>
          </div>
          <span className="text-red-500">{errors.verifyCode && errors.verifyCode.message}</span>
        </div>
        <Button
          disabled={disabledRegister || loading}
          type="submit"
          className="w-full py-2 fs-4 mb-4 rounded-md bg-gradient-to-r from-emerald-100 to-sky-300 text-slate-800 font-semibold"
        >
          {loading ? <InsideLoading /> : 'Register'}
        </Button>
        <div className="flex items-center justify-center">
          Already have an account?
          <Link onClick={toggleSignIn} className="mx-1 text-emerald-700">
            Login
          </Link>
        </div>
      </form>
    </>
  )
}
