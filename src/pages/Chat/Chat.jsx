import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../App'

import { Avatar, Button, Dropdown, Form, Image, Input, List, Result, Skeleton, Upload } from 'antd'
import {
  CloseOutlined,
  HomeFilled,
  MoreOutlined,
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { getBase64 } from '../../services/commonService'
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
  const { chatConnection } = useChat()

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
      if (chatConnection && chatConnection?.state === HubConnectionState.Connected) {
        try {
          const res = await chatConnection.invoke('GetConversations')
          setConversations(res)
          if (currentId) {
            await handleGetMessage(currentId)
            setCurrentId(currentId)
          } else if (res?.length) {
            const firstId = res[0]
            await handleGetMessage(firstId)
            setCurrentId(firstId)
          }
          chatConnection.on('USER_START_CHAT', (id) => {
            setConversations((pre) => pre.concat(id))
            if (!currentId) setCurrentId(id)
          })

          // chatConnection.on('USER_DISCONNECT', (connectionId) => {
          //   setMessages((pre) => {
          //     return pre
          //       .filter((item) => item.messages && item.messages.length)
          //       .map((item) => {
          //         if (item.connectionId === connectionId) {
          //           return { ...item, close: true }
          //         }
          //         return item
          //       })
          //   })
          // })

          chatConnection.on('onAdmin', (id, message) => {
            const mess = {
              content: message,
              isUser: true,
              createAt: new Date(),
            }
            if (currentId === id) {
              setCurrentConversation((pre) => pre.concat(mess))
            } else {
              setConversations((pre) =>
                pre.map((item) =>
                  item.id === id ? { ...item, unread: (item?.unread ?? 0) + 1 } : item,
                ),
              )
            }
          })
        } catch (err) {
          console.error(err.toString())
        }
      }
    }
    getUserConnections()
    // eslint-disable-next-line
  }, [chatConnection])

  // const loadMoreData = () => {
  //   // if (loading) {
  //   //   return
  //   // }
  //   // setLoading(true)
  //   // fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
  //   //   .then((res) => res.json())
  //   //   .then((body) => {
  //   //     // setData([...data, ...body.results])
  //   //     setLoading(false)
  //   //   })
  //   //   .catch(() => {
  //   //     setLoading(false)
  //   //   })
  // }

  // useEffect(() => {
  //   loadMoreData()
  // }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
      inputRef.current?.focus({
        cursor: 'start',
      })
    }
    // if (!currentConnection && messages.length) {
    //   setCurrentConnection(messages[0]?.connectionId)
    // }
  }, [currentConversation])

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList)

  const handleGetMessage = async (id) => {
    if (chatConnection) {
      setLoading(true)
      setCurrentId(id)
      setSearchParams({ id })
      const res = await chatConnection.invoke('GetConversation', id)
      const messages = res?.messages ?? []
      setCurrentConversation(messages)
      setLoading(false)
    }
  }

  const handleSendMessage = async (values) => {
    if (currentId) {
      const mess = { ...values, isUser: false, createAt: new Date() }
      setCurrentConversation((pre) => pre.concat(mess))
      form.resetFields()
      await chatConnection.invoke('SendToUser', currentId, values.content)
    }
  }

  const handleCloseChat = async (session) => {
    if (chatConnection) {
      await chatConnection.invoke('CloseChat', session)
      setConversations((pre) => {
        const newList = pre.filter((id) => id !== session)

        if (session === currentId) {
          if (newList.length) {
            const firstId = newList[0]
            handleGetMessage(firstId)
            setCurrentId(firstId)
          }
        }
        return newList
      })
    }
  }

  const items = (session) => [
    {
      key: '1',
      label: 'Xóa cuộc trò chuyện',
      onClick: () => handleCloseChat(session),
    },
  ]

  return (
    <div className="pb-4">
      <BreadcrumbLink className="py-2" breadcrumbItems={breadcrumbItems} />
      <div className="p-2 bg-white rounded-lg drop-shadow min-h-content">
        <div className="grid grid-cols-4 gap-2 bg-white h-content">
          {conversations.length ? (
            <>
              <div className="overflow-auto border-r">
                <List
                  dataSource={conversations}
                  renderItem={(id, i) => (
                    <List.Item
                      key={id}
                      className={`relative cursor-pointer hover:bg-gray-100 ${
                        currentId === id && 'bg-gray-200'
                      }`}
                    >
                      <List.Item.Meta
                        onClick={() => currentId !== id && handleGetMessage(id)}
                        className="px-2"
                        avatar={
                          <Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`} />
                        }
                        title={
                          <>
                            <div className="hidden md:block">Người dùng {i + 1}</div>
                            <div className="text-gray-500">{id}</div>
                          </>
                        }
                      />
                      <Dropdown trigger={['click']} menu={{ items: items(id) }}>
                        <Button type="text" className="absolute top-1 right-0 px-2 mr-1">
                          <MoreOutlined />
                        </Button>
                      </Dropdown>
                    </List.Item>
                  )}
                />
              </div>
              <div className="col-span-3 flex flex-col max-h-content">
                <div ref={contentRef} className="flex-1 overflow-y-auto">
                  {loading ? (
                    <>
                      <Skeleton avatar active />
                      <Skeleton avatar active />
                      <Skeleton avatar active />
                    </>
                  ) : (
                    currentConversation.map((e, i) => (
                      <Message
                        key={i}
                        content={e.content}
                        isUser={e.isUser}
                        createAt={e.createAt}
                      />
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
                  {conversations.find((e) => e.id === currentId)?.close ? (
                    <div className="text-center text-lg">
                      <WarningFilled className="text-yellow-500" /> Người dùng đã đóng đoạn chat
                    </div>
                  ) : (
                    currentConversation && (
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
                            className="rounded-sm"
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
