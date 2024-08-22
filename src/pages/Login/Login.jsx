import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../../logo.png'
import authService from '../../services/authService'
import { useAuth } from '../../App'
import authActions from '../../services/authAction'
import { Button, Form, Input, message } from 'antd'
import { showError } from '../../services/commonService'

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

  const handleSubmitLogin = async () => {
    try {
      setLoading(true)
      await authService.login(form.getFieldsValue())
      dispatch(authActions.LOGIN)
      navigate('/home')
    } catch (error) {
      message.error(showError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-stone-300">
        <div className="transition-all rounded-md bg-slate-100 w-11/12 md:w-3/5 lg:w-2/5 2xl:w-1/3 px-10 py-4 drop-shadow-lg space-y-4">
          <>
            <div className="relative flex items-center justify-center">
              <img width="70" height="70" className="py-2 fs-4" src={logo} alt="logo" />
            </div>
            <p className="text-center font-bold text-xl mb-2">VOA Store Admin</p>
          </>
          <Form form={form} disabled={loading} onFinish={handleSubmitLogin}>
            <div className="space-y-4">
              <Form.Item name="username" rules={[{ required: true, message: 'Email is required' }]}>
                <Input placeholder="Email" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Password is required' }]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>
              <Button
                loading={loading}
                htmlType="submit"
                type="primary"
                className="bg-blue-500 w-full"
                size="large"
              >
                Đăng nhập
              </Button>
            </div>
          </Form>
          <div className="text-center">
            <Link className="text-gray-700">Quên mật khẩu?</Link>
          </div>
        </div>
      </div>
    </>
  )
}
