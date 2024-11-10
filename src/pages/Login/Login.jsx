import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
        <div className="transition-all rounded-md bg-slate-100 w-11/12 md:w-3/5 lg:w-1/3 2xl:w-1/3 p-10 drop-shadow space-y-4">
          {/* <div className="relative flex items-center justify-center">
              <img width="150" height="70" className="py-2 fs-4" src="/logo.png" alt="logo" />
            </div> */}
          <div className="text-center font-bold text-2xl">VOA Store</div>
          <Form form={form} disabled={loading} onFinish={handleSubmitLogin}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập Tên tài khoản' }]}
            >
              <Input placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
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
          </Form>
        </div>
      </div>
    </>
  )
}
