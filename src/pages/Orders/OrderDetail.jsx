import { App, Button, Card, Descriptions, Table } from 'antd'
import { formatVND, showError } from '../../services/commonService'
import { useEffect, useState } from 'react'
import orderService from '../../services/orders/orderService'
import { useParams } from 'react-router-dom'
import { useLoading } from '../../App'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import { HomeFilled } from '@ant-design/icons'

const breadcrumbItems = [
  {
    path: '/',
    title: <HomeFilled />,
  },
  {
    path: 'orders-management',
    title: 'Đơn hàng',
  },
  {
    title: 'Chi tiết đơn hàng',
  },
]

const columnProducts = () => [
  {
    title: 'Tên sản phẩm',
    dataIndex: 'productName',
  },
  {
    title: 'Màu sắc',
    dataIndex: 'colorName',
  },
  {
    title: 'Kích cỡ',
    dataIndex: 'sizeName',
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
  },
  {
    title: 'Giá',
    dataIndex: 'price',
    render: (value) => formatVND.format(value),
  },
]

const sumary = (id, orderDate, total) => [
  {
    key: '1',
    label: 'Order ID',
  },
  {
    key: '2',
    children: `#${id}`,
  },
  {
    key: '3',
    label: 'Order Date',
  },
  {
    key: '4',
    children: orderDate,
  },
  {
    key: '5',
    label: 'Total',
  },
  {
    key: '6',
    children: total,
  },
]

const cartTotal = (subtotal, shippingCost, total) => [
  {
    key: '1',
    label: 'Subtotal',
  },
  {
    key: '2',
    children: subtotal,
  },
  {
    key: '3',
    label: 'Shipping',
  },
  {
    key: '4',
    children: shippingCost,
  },
  {
    key: '5',
    label: 'Total Price',
  },
  {
    key: '6',
    children: total,
  },
]

export default function OrderDetail() {
  const { id } = useParams()
  const { setIsLoading } = useLoading()
  const { message } = App.useApp()
  // const [loading, setLoading] = useState(false)
  const [orderDetail, setOrderDetail] = useState([])

  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      try {
        const res = await orderService.getOrderDetail(id)
        setOrderDetail(res.data.productOrderDetails)
      } catch (error) {
        message.error(showError(error))
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id, setIsLoading, message])

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems} />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="grid gap-4 grid-cols-1 h-fit">
            <Card className="drop-shadow" size="small">
              <Table
                columns={columnProducts()}
                dataSource={orderDetail}
                rowKey={(record) => record.productId}
                className="overflow-x-auto"
                rowHoverable
                pagination={false}
              />
            </Card>
            <Card className="drop-shadow h-fit" size="small">
              <Descriptions title="Cart Items" column={2} items={cartTotal(0, 1, 2)} />
            </Card>
          </div>
          <div className="grid gap-4 grid-cols-1 h-fit">
            <Card className="drop-shadow" size="small">
              <Descriptions title="Sumary" column={2} items={sumary(id, 2, 3)} />
            </Card>
            <Card className="drop-shadow" size="small">
              <Descriptions
                title="Shipping Address"
                column={2}
                items={[
                  {
                    key: '1',
                    children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
                  },
                ]}
              />
            </Card>
            <Card className="drop-shadow" size="small">
              <Descriptions
                title="Expected Date Of Delivery"
                column={2}
                items={[
                  {
                    key: '1',
                    children: '20 Nov 2023',
                  },
                ]}
              />
              <Button className="w-full" type="primary" size="large">
                Track Order
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
