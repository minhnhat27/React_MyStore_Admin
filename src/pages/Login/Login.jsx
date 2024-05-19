import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../../logo.png'
import authService from '../../services/authService'
import { useAuth } from '../../App'
import notificationService from '../../services/notificationService'
import authActions from '../../services/authAction'
import { Button, Form, Input, Spin } from 'antd'

export default function Login() {
  const { state, dispatch } = useAuth()
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/')
    }
  }, [state.isAuthenticated, navigate])

  const handleSubmitLogin = () => {
    setLoading(true)
    authService
      .login(form.getFieldsValue())
      .then(() => {
        dispatch(authActions.LOGIN)
        navigate('/')
        // notificationService.Success('Login successfully')
      })
      .catch((err) => {
        err.response
          ? form.setFields([
              {
                name: 'password',
                errors: ['Invalid username or password'],
              },
            ])
          : notificationService.Danger(err.message)
      })
      .finally(() => setLoading(false))
  }

  return (
    <>
      <div className="flex justify-center items-center h-full">
        <div className="rounded-md bg-zinc-50 h-fit w-11/12 md:w-3/5 lg:w-1/2 px-10 py-4 drop-shadow space-y-4">
          <div>
            <div className="relative flex items-center justify-center">
              <img width="70" height="70" className="py-2 fs-4" src={logo} alt="logo" />
            </div>
            <p className="text-center font-bold text-xl mb-2">NNN Store Admin</p>
          </div>
          <Form form={form} disabled={loading} onFinish={handleSubmitLogin}>
            <div className="space-y-4">
              <Form.Item name="email" rules={[{ required: true, message: 'Email is required' }]}>
                <Input placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Password is required' }]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>
              <Button htmlType="submit" type="primary" className="bg-blue-500 w-full" size="large">
                {loading ? <Spin /> : 'Login'}
              </Button>

              {/* <button
              disabled={loading}
              type="submit"
              className="w-full py-2 fs-4 mb-4 rounded-md bg-gradient-to-r from-emerald-100 to-sky-300 text-slate-800 font-semibold"
            >
              {loading ? <InsideLoading /> : 'Login'}
            </button> */}
            </div>
          </Form>
          <div className="text-center">
            <Link className="text-gray-700">Forget password?</Link>
          </div>
        </div>
      </div>
    </>
  )
}
