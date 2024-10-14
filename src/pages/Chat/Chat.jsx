import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../App'

import { Avatar, Breadcrumb, Button, Form, Image, Input, List, Result, Upload } from 'antd'
import {
  CloseOutlined,
  HomeFilled,
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { getBase64 } from '../../services/commonService'
import Message from '../../components/Message'
import { HubConnectionState } from '@microsoft/signalr'
import { useSearchParams } from 'react-router-dom'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    title: 'Tin nhắn',
  },
]

export default function Chat() {
  // const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const { chatConnection } = useChat()

  const inputRef = useRef(null)
  const contentRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [currentConnection, setCurrentConnection] = useState(() => searchParams.get('connectionId'))

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    const getUserConnections = async () => {
      if (chatConnection && chatConnection?.state === HubConnectionState.Connected) {
        try {
          const getMessage = await chatConnection.invoke('GetMessages')
          setMessages(getMessage)
          getMessage.length && setCurrentConnection(getMessage[0]?.connectionId)

          chatConnection.on('USER_CONNECT', (newConnectionId) => {
            setMessages((pre) => [...pre, { connectionId: newConnectionId, messages: [] }])
            if (!currentConnection) setCurrentConnection(newConnectionId)
          })

          chatConnection.on('USER_DISCONNECT', (connectionId) => {
            setMessages((pre) => {
              return pre
                .filter((item) => item.messages && item.messages.length)
                .map((item) => {
                  if (item.connectionId === connectionId) {
                    return { ...item, close: true }
                  }
                  return item
                })
            })
          })

          chatConnection.on('onAdmin', (connectionId, message) => {
            const mess = {
              message: message,
              isUser: true,
            }
            setMessages((pre) => {
              return pre.map((item) => {
                const oldMessages = item.messages
                if (connectionId === item.connectionId) {
                  return { ...item, messages: [...oldMessages, mess] }
                }
                return item
              })
            })
          })
        } catch (err) {
          console.error(err.toString())
        }
      }
    }
    getUserConnections()
    // eslint-disable-next-line
  }, [chatConnection])

  const loadMoreData = () => {
    // if (loading) {
    //   return
    // }
    // setLoading(true)
    // fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
    //   .then((res) => res.json())
    //   .then((body) => {
    //     // setData([...data, ...body.results])
    //     setLoading(false)
    //   })
    //   .catch(() => {
    //     setLoading(false)
    //   })
  }

  useEffect(() => {
    loadMoreData()
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
      inputRef.current?.focus({
        cursor: 'start',
      })
    }
    if (!currentConnection && messages.length) {
      setCurrentConnection(messages[0]?.connectionId)
    }
  }, [messages, currentConnection])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList)

  const onClickUser = (connectionId) => setCurrentConnection(connectionId)

  const handleSendMessage = (values) => {
    if (currentConnection) {
      const mess = { ...values, isUser: false }
      const newMessage = messages.map((item) => {
        const oldMessages = item.messages
        if (currentConnection === item.connectionId) {
          return { ...item, messages: [...oldMessages, mess] }
        }
        return item
      })
      setMessages(newMessage)
      chatConnection.invoke('SendToUser', currentConnection, values.message)
      form.resetFields()
    }
  }

  return (
    <div className="pb-4">
      <Breadcrumb className="py-2" items={breadcrumbItems} />
      <div className="p-2 bg-white rounded-lg drop-shadow min-h-content">
        <div className="grid grid-cols-4 gap-2 bg-white h-content">
          {messages.length ? (
            <>
              <div className="overflow-auto border-r">
                <List
                  dataSource={messages}
                  renderItem={(item, i) => (
                    <List.Item
                      key={item.connectionId}
                      onClick={() => onClickUser(item.connectionId)}
                      className={`cursor-pointer hover:bg-gray-100 ${
                        currentConnection === item.connectionId && 'bg-gray-200'
                      }`}
                    >
                      <List.Item.Meta
                        className="px-2"
                        title={
                          <div className="flex justify-center md:justify-start items-center gap-2">
                            <Avatar>
                              <UserOutlined />
                            </Avatar>
                            <span className="hidden md:block">Người dùng {i + 1}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
              <div className="col-span-3 flex flex-col max-h-content">
                <div ref={contentRef} className="flex-1 overflow-y-auto">
                  {currentConnection &&
                    messages
                      .find((e) => e.connectionId === currentConnection)
                      ?.messages.map((e, i) => (
                        <Message key={i} message={e.message} isUser={e.isUser} />
                      ))}

                  {!messages.length ||
                    !currentConnection ||
                    (!messages.find((e) => e.connectionId === currentConnection)?.messages
                      .length && (
                      <div className="flex justify-center">Người dùng chưa gửi tin nhắn</div>
                    ))}
                </div>

                <div>
                  {fileList.map((file, i) => (
                    <div key={i} className="relative cursor-pointer select-none w-fit mx-2 group">
                      <Image
                        rootClassName="border"
                        width={60}
                        height={60}
                        className="rounded object-cover"
                        src={file.originFileObj ? URL.createObjectURL(file.originFileObj) : ''}
                        alt={file.name}
                      />
                      <CloseOutlined
                        onClick={() => setFileList((pre) => pre.filter((e) => e.uid !== file.uid))}
                        className="hidden group-hover:block absolute -top-2 -right-2 bg-white font-bold rounded-full text-[0.65rem] p-[0.15rem] border"
                      />
                    </div>
                  ))}
                  {messages.find((e) => e.connectionId === currentConnection)?.close ? (
                    <div className="text-center text-lg">
                      <WarningFilled className="text-yellow-500" /> Đoạn chat đã kết thúc
                    </div>
                  ) : (
                    currentConnection && (
                      <Form
                        form={form}
                        variant="borderless"
                        className="flex gap-1"
                        onFinish={handleSendMessage}
                      >
                        <Form.Item noStyle name="message" className="flex-1">
                          <Input
                            allowClear
                            ref={inputRef}
                            className="rounded-sm"
                            placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
                          />
                        </Form.Item>
                        <Form.Item noStyle dependencies={['message']}>
                          {({ getFieldValue }) => {
                            const text = getFieldValue('message')?.trim()
                            return (
                              <Button
                                disabled={!text}
                                className="px-1"
                                htmlType="submit"
                                type="link"
                              >
                                <SendOutlined className="text-xl" />
                              </Button>
                            )
                          }}
                        </Form.Item>
                        <Upload
                          beforeUpload={() => false}
                          fileList={fileList}
                          listType="picture"
                          maxCount={1}
                          showUploadList={false}
                          onPreview={handlePreview}
                          onChange={handleChange}
                        >
                          <Button disabled={fileList.length > 0} className="px-1" type="link">
                            <PaperClipOutlined className="text-xl" />
                          </Button>
                        </Upload>
                        {previewImage && (
                          <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                              visible: previewOpen,
                              onVisibleChange: (visible) => setPreviewOpen(visible),
                              afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                          />
                        )}
                      </Form>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center col-span-full">
              <Result icon={<SmileOutlined />} title="Chưa có tin nhắn nào!" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
