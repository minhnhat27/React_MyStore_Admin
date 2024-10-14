import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'

export default function Message({ message, isUser }) {
  return (
    <div className={`flex gap-2 m-2 ${!isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser && (
        <Avatar>
          <UserOutlined />
        </Avatar>
      )}
      <div
        className={`p-2 max-w-[60vw] overflow-auto rounded ${
          !isUser ? 'bg-sky-50 border drop-shadow-sm' : 'bg-gray-200'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
