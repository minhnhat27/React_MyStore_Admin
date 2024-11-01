import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import { getTimeHHmm } from '../../services/commonService'

export default function Message({ content, isUser, createAt }) {
  return (
    <div className={`flex gap-2 m-2 ${!isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser && (
        <Avatar>
          <UserOutlined />
        </Avatar>
      )}
      <div className={`flex items-end gap-1 ${isUser && 'flex-row-reverse'}`}>
        {createAt && <span className="text-[0.6rem]">{getTimeHHmm(createAt)}</span>}
        <div
          className={`p-2 max-w-[60vw] overflow-auto rounded ${
            !isUser ? 'bg-sky-50 border drop-shadow-sm' : 'bg-gray-200'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
