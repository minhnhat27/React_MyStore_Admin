import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import authService from '../../services/authService'
import { useAuth } from '../../App'
import authAction from '../../services/authAction'
import Image from '../UI/Image'
import InsideLoading from '../Loading/InsideLoading'

import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoogleLogin } from '@react-oauth/google'
import { LoginSocialFacebook } from 'reactjs-social-login'

export default function Login({ toggleSignUp, regSuccess, setRegSuccess, closeLogin }) {
  const { dispatch } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm()

  const handleSubmitLogin = () => {
    setLoading(true)
    setRegSuccess(false)
    authService
      .login(getValues())
      .then(() => {
        setLoading(false)
        dispatch(authAction.LOGIN)
        closeLogin()
      })
      .catch(({ response }) => {
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

  const loginGoogle = (credential) => {
    setLoading(true)
    authService
      .loginGoogle({ id: credential })
      .then(() => {
        setLoading(false)
        dispatch(authAction.LOGIN)
        closeLogin()
      })
      .catch(({ response }) => {
        setLoading(false)
        switch (response.status) {
          case 404:
            setError('password', { message: "User doesn't exist" })
            break
          default:
            setError('password', { message: 'An error occurred. Please try again' })
        }
      })
  }

  const loginFacebook = (e) => {
    console.log(e)
    // FacebookLoginClient.login((res) => {
    //   console.log(res)
    // })
  }

  return (
    <>
      <p className="text-center font-bold text-xl">N Store Login</p>
      <form method="POST" onSubmit={handleSubmit(handleSubmitLogin)}>
        <div className="my-3">
          <Input
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
            <Input
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
          <span className="text-red-500">
            {errors.password && errors.password.message} {regSuccess && 'Register Successfully'}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Input type="checkbox" id="flexCheckChecked" />
            <label className="ml-1 select-none" htmlFor="flexCheckChecked">
              Remember
            </label>
          </div>
          <Link className="text-emerald-700">Forget password?</Link>
        </div>
        <Button
          disabled={loading}
          type="submit"
          className="w-full py-2 fs-4 mb-4 rounded-md bg-gradient-to-r from-emerald-100 to-sky-300 text-slate-800 font-semibold"
        >
          {loading ? <InsideLoading /> : 'Login'}
        </Button>
        <div className="flex items-center justify-center space-x-4">
          <GoogleLogin
            context="signin"
            type="icon"
            shape="circle"
            onSuccess={({ credential }) => loginGoogle(credential)}
          />
          <LoginSocialFacebook
            // isOnlyGetToken
            appId={process.env.REACT_APP_FB_APP_ID || ''}
            onResolve={loginFacebook}
            onReject={(err) => {
              console.log(err)
            }}
          >
            <Image
              width="35"
              height="35"
              className="cursor-pointer"
              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            />
          </LoginSocialFacebook>
          {/* <LoginSocialGoogle
            //isOnlyGetToken
            client_id={process.env.REACT_APP_GG_APP_ID || ''}
            onResolve={(res) => console.log(res)}
            onReject={(err) => {
              console.log(err)
            }}
            typeResponse="idToken"
          >
            <Image
              width="35"
              height="35"
              className="cursor-pointer"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
              onClick={loginFacebook}
            />
          </LoginSocialGoogle> */}
        </div>
        <div className="flex items-center justify-center">
          <p className="mb-0">Don't have an account?</p>
          <Link onClick={toggleSignUp} className="mx-1 text-emerald-700">
            Create account
          </Link>
        </div>
      </form>
    </>
  )
}
