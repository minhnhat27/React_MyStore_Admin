import { Steps } from 'antd'
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons'

export default function Home() {
  return (
    <div className="h-[300vh]">
      <Steps
        items={[
          {
            title: 'Login',
            status: 'finish',
            icon: <UserOutlined />,
          },
          {
            title: 'Verification',
            status: 'finish',
            icon: <SolutionOutlined />,
          },
          {
            title: 'Pay',
            status: 'process',
            icon: <LoadingOutlined />,
          },
          {
            title: 'Done',
            status: 'wait',
            icon: <SmileOutlined />,
          },
        ]}
      />
    </div>
  )
}
