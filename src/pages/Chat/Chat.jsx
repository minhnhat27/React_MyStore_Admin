import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '../../App'

import {
  Avatar,
  Badge,
  Button,
  Divider,
  Dropdown,
  Form,
  Image as AntdImage,
  Input,
  List,
  Result,
  Skeleton,
  Splitter,
  Upload,
  App,
} from 'antd'
import {
  CloseOutlined,
  HomeFilled,
  MoreOutlined,
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { compressImage, formatDate, getBase64 } from '../../services/commonService'
import Message from '../../components/Message'
import { HubConnectionState } from '@microsoft/signalr'
import { useSearchParams } from 'react-router-dom'
import BreadcrumbLink from '../../components/BreadcrumbLink'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { chatConnection } = useChat()

  const [hasAdminRegistered, setHasAdminRegistered] = useState(false)

  const inputRef = useRef(null)
  const contentRef = useRef(null)

  const [conversations, setConversations] = useState([])

  const [loading, setLoading] = useState(false)
  const [currentId, setCurrentId] = useState(() => searchParams.get('id'))
  const [currentConversation, setCurrentConversation] = useState([])

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    const getUserConnections = async () => {
      if (
        chatConnection &&
        chatConnection?.state === HubConnectionState.Connected &&
        !hasAdminRegistered
      ) {
        try {
          const res = (await chatConnection.invoke('GetConversations')) ?? []
          setConversations(res)
          if (currentId) {
            await handleGetMessage(currentId)
          } else if (res.length) {
            const firstId = res[0].id
            if (firstId) await handleGetMessage(firstId)
          }

          chatConnection.on('CLOSE_CHAT', (id) => {
            setConversations((pre) =>
              pre.map((item) => (item.id === id ? { ...item, closed: true } : item)),
            )
          })

          chatConnection.on('onAdmin', (id, message, image) => {
            const mess = {
              content: message,
              isUser: true,
              createAt: new Date().toISOString(),
              image,
            }

            setCurrentId((preId) => {
              if (preId && preId === id) {
                setCurrentConversation((pre) => [...pre, mess])
              } else {
                setConversations((pre) => {
                  if (!pre.length) {
                    setCurrentId(id)
                    handleGetMessage(id, false)
                  }
                  const exist = pre.find((e) => e.id === id)
                  if (exist) {
                    return pre.map((item) =>
                      item.id === id ? { ...item, unread: (item.unread ?? 0) + 1 } : item,
                    )
                  } else {
                    if (!pre.length) {
                      return [...pre, { id, unread: 0, closed: false }]
                    }
                    return [...pre, { id, unread: 1, closed: false }]
                  }
                })
              }
              return preId
            })
          })
          setHasAdminRegistered(true)
        } catch (err) {
          console.error(err)
        }
      }
    }
    getUserConnections()
    // eslint-disable-next-line
  }, [chatConnection])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
      inputRef.current?.focus({
        cursor: 'start',
      })
    }
  }, [currentConversation])

  useEffect(() => {
    if (currentId) {
      setSearchParams({ id: currentId })
      setFileList([])
    } else setSearchParams({})
  }, [currentId, setSearchParams])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList)

  const handleGetMessage = async (id, setId = true) => {
    if (chatConnection) {
      setLoading(true)
      form.resetFields()
      const res = await chatConnection.invoke('GetConversation', id)
      const messages = res?.messages ?? []
      if (setId) {
        setCurrentId(id)
        setConversations((pre) =>
          pre.map((item) => (item.id === id ? { ...item, unread: 0 } : item)),
        )
      }
      setCurrentConversation(messages)
      setLoading(false)
    }
  }

  const beforeUpload = async (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ được tải lên ảnh!')
      return Upload.LIST_IGNORE
    }

    const maxSizeInBytes = 3 * 1024 * 1024 // 3MB
    if (file.size > maxSizeInBytes) {
      message.error('Kích thước ảnh không vượt quá 2MB!')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const handleSendMessage = async (values) => {
    try {
      if (currentId) {
        let image = null
        if (fileList.length) {
          image = await compressImage(fileList[0].originFileObj)
          if (!image) message.error('Ảnh quá lớn không thể gửi ảnh')
        }

        const mess = { ...values, isUser: false, createAt: new Date().toISOString(), image }
        form.resetFields()
        setFileList([])

        await chatConnection.invoke('SendToUser', currentId, values.content, image)
        setCurrentConversation((pre) => [...pre, mess])
      }
    } catch (error) {
      console.log(error)
      message.error('Có lỗi xảy ra. Không thể gửi tin nhắn!')
    }
  }

  const handleRemoveChat = async (session) => {
    if (chatConnection) {
      await chatConnection.invoke('RemoveChat', session)
      setConversations((pre) => {
        const newList = pre.filter((item) => item.id !== session)
        if (session === currentId) {
          if (newList.length) {
            const firstId = newList[0].id
            if (firstId) handleGetMessage(firstId)
          } else {
            setCurrentConversation([])
            setCurrentId(null)
          }
        }
        return newList
      })
    }
  }

  const groupMessagesByDate = useMemo(() => {
    if (!currentConversation) {
      return {}
    }
    return currentConversation.reduce((pre, message) => {
      const dateKey = message.createAt ? formatDate(message.createAt) : 'unknown_date'
      if (!pre[dateKey]) {
        pre[dateKey] = []
      }
      pre[dateKey].push(message)
      return pre
    }, {})
  }, [currentConversation])

  const items = (session) => [
    {
      key: '1',
      label: 'Xóa cuộc trò chuyện',
      onClick: () => handleRemoveChat(session),
    },
  ]

  return (
    <div className="pb-4">
      <BreadcrumbLink className="py-2" breadcrumbItems={breadcrumbItems} />
      <div className="p-2 bg-white rounded-lg drop-shadow min-h-content">
        <div className="bg-white h-content">
          {conversations.length ? (
            <>
              <Splitter>
                <Splitter.Panel defaultSize="30%" min="20%" max="50%">
                  <div className="overflow-auto border-r h-full">
                    <List
                      dataSource={conversations}
                      renderItem={(item, i) => (
                        <List.Item
                          onClick={() => currentId !== item.id && handleGetMessage(item.id)}
                          key={i}
                          className={`cursor-pointer mb-1 rounded ${
                            currentId === item.id ? 'bg-green-300' : 'hover:bg-green-100'
                          }`}
                          actions={[
                            <Dropdown trigger={['click']} menu={{ items: items(item.id) }}>
                              <Button type="text" className="px-2">
                                <MoreOutlined />
                              </Button>
                            </Dropdown>,
                          ]}
                        >
                          <List.Item.Meta
                            className="md:px-2"
                            avatar={
                              !item.closed ? (
                                <Badge
                                  count={item.unread}
                                  style={{
                                    backgroundColor: '#ef4444',
                                  }}
                                  size="small"
                                >
                                  <Avatar
                                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`}
                                  />
                                </Badge>
                              ) : null
                            }
                            title={
                              item.closed ? (
                                <div className="text-xs italic px-2 text-gray-800">
                                  Đoạn chat đã kết thúc
                                </div>
                              ) : (
                                <div className="hidden sm:block truncate text-gray-800">
                                  Người dùng {i + 1}
                                </div>
                              )
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </Splitter.Panel>
                <Splitter.Panel>
                  <div className="flex flex-col max-h-content h-full">
                    <div ref={contentRef} className="flex-1 overflow-y-auto">
                      {loading ? (
                        <>
                          <Skeleton avatar active />
                          <Skeleton avatar active />
                          <Skeleton avatar active />
                        </>
                      ) : (
                        Object.keys(groupMessagesByDate).map((date, i) => (
                          <div key={i}>
                            <Divider plain style={{ fontSize: 12 }}>
                              {date}
                            </Divider>
                            {groupMessagesByDate[date]?.map((e, i) => (
                              <Message
                                key={i}
                                content={e.content}
                                isUser={e.isUser}
                                createAt={e.createAt}
                                image={e.image}
                              />
                            ))}
                          </div>
                        ))
                      )}

                      {/* {!messages.length ||
                    !currentConnection ||
                    (!messages.find((e) => e.connectionId === currentConnection)?.messages
                      .length && (
                      <div className="flex justify-center">Người dùng chưa gửi tin nhắn</div>
                    ))} */}
                    </div>

                    <div>
                      {fileList.map((file, i) => (
                        <div
                          key={i}
                          className="relative cursor-pointer select-none w-fit mx-2 group"
                        >
                          <AntdImage
                            rootClassName="border"
                            width={60}
                            height={60}
                            className="rounded object-cover"
                            src={file.originFileObj ? URL.createObjectURL(file.originFileObj) : ''}
                            alt={file.name}
                          />
                          <CloseOutlined
                            onClick={() =>
                              setFileList((pre) => pre.filter((e) => e.uid !== file.uid))
                            }
                            className="hidden group-hover:block absolute -top-2 -right-2 bg-white font-bold rounded-full text-[0.65rem] p-[0.15rem] border"
                          />
                        </div>
                      ))}
                      {conversations.find((e) => e.id === currentId)?.closed ? (
                        <div className="text-center text-lg">
                          <WarningFilled className="text-yellow-500" /> Người dùng đã đóng đoạn chat
                        </div>
                      ) : (
                        currentConversation && (
                          <>
                            <Divider className="my-1" />
                            <Form
                              form={form}
                              variant="borderless"
                              className="flex gap-1"
                              onFinish={handleSendMessage}
                            >
                              <Form.Item noStyle name="content" className="flex-1">
                                <Input
                                  allowClear
                                  ref={inputRef}
                                  className="rounded-sm border-gray-300"
                                  placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
                                />
                              </Form.Item>
                              <Form.Item noStyle dependencies={['content']}>
                                {({ getFieldValue }) => {
                                  const text = getFieldValue('content')?.trim()
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
                                beforeUpload={beforeUpload}
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
                                <AntdImage
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
                          </>
                        )
                      )}
                    </div>
                  </div>
                </Splitter.Panel>
              </Splitter>
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
