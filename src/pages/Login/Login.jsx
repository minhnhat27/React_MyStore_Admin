import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom'

import InsideLoading from '../../components/Loading/InsideLoading'
import logo from '../../logo.png'
import authService from '../../services/authService'
import { useAuth } from '../../App'
import notificationService from '../../services/notificationService'
import authActions from '../../services/authAction'

export default function Login() {
  const { state, dispatch } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/')
    }
  }, [state.isAuthenticated, navigate])

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
  } = useForm()

  const handleSubmitLogin = () => {
    setLoading(true)
    authService
      .login(getValues())
      .then(() => {
        setLoading(false)
        dispatch(authActions.LOGIN)
        navigate('/')
        notificationService.Success('Login successfully')
      })
      .catch(({ response }) => {
        console.log(response)
        setLoading(false)
        switch (response.status) {
          case 409:
            setError('password', { message: 'Email or password incorrect' })
            break
          default:
            setError('password', { message: 'An error occurred. Please try again' })
        }
      })
  }

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div className="rounded-md bg-zinc-50 h-fit w-11/12 lg:w-1/2 px-10 py-4 drop-shadow">
          <div className="relative flex items-center justify-center">
            <img width="70" height="70" className="py-2 fs-4" src={logo} alt="logo" />
          </div>
          <p className="text-center font-bold text-xl">NNN Store Admin</p>
          <form method="POST" onSubmit={handleSubmit(handleSubmitLogin)}>
            <div className="my-3">
              <input
                type="email"
                name="email"
                className="w-full p-2 border rounded-md focus:outline-blue-500"
                placeholder="Email"
                id="email"
                {...register('email', { required: 'Email is required' })}
              />
              <span className="text-red-500">{errors.email && errors.email.message}</span>
            </div>
            <div className="my-3">
              <div className="flex">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full p-2 border rounded-md focus:outline-blue-500"
                  placeholder="Password"
                  name="password"
                  id="password"
                  {...register('password', { required: 'Password is required' })}
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
            <button
              disabled={loading}
              type="submit"
              className="w-full py-2 fs-4 mb-4 rounded-md bg-gradient-to-r from-emerald-100 to-sky-300 text-slate-800 font-semibold"
            >
              {loading ? <InsideLoading /> : 'Login'}
            </button>
            <div className="text-center">
              <Link className="text-gray-700">Forget password?</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
