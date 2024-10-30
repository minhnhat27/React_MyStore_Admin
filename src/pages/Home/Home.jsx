import { Card, Divider, Statistic } from 'antd'
import { ArrowUpOutlined, IdcardTwoTone, PieChartTwoTone, ShopTwoTone } from '@ant-design/icons'
import { formatVND } from '../../services/commonService'
import { Column, DualAxes } from '@ant-design/charts'
import { STATISTICS_API } from '../../services/const'
import { useEffect, useState } from 'react'
import httpService from '../../services/http-service'

export default function Home() {
  // const [loading, setLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [general, setGeneral] = useState()
  const [revenueThisYear, setRevenueThisYear] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await httpService.get(`${STATISTICS_API}/revenue-this-year`)
        setRevenueThisYear(data)
      } catch (error) {}
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await httpService.get(`${STATISTICS_API}/general`)
        setGeneral(data)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const config = {
    data: revenueThisYear,
    xField: 'month',
    yField: 'revenue',
    // colorField: 'year',
    // group: true,
    style: {
      inset: 5,
    },
    onReady: ({ chart }) => {
      try {
        chart.on('afterrender', () => {
          // chart.emit('legend:filter', {
          //   data: { channel: 'color', values: ['London'] },
          // })
        })
      } catch (e) {
        console.error(e)
      }
    },
  }

  const configDualAxes = {
    xField: 'month',
    data: revenueThisYear,
    legend: {
      color: {
        itemMarker: (v) => {
          if (v === 'revenue') return 'rect'
          return 'smooth'
        },
      },
    },
    tooltip: {
      title: (d) => 'Tháng ' + d.month,
    },
    children: [
      {
        type: 'interval',
        yField: 'revenue',
      },
      {
        type: 'line',
        yField: 'totalOrders',
        shapeField: 'smooth',
        scale: { color: { relations: [['totalOrders', '#fdae6b']] } },
        axis: { y: { position: 'right' } },
        style: { lineWidth: 2 },
      },
    ],
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-8">
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <div>Tổng đơn hàng</div>
          <div className="flex gap-2 items-center mt-2">
            <PieChartTwoTone className="text-4xl" />
            <div className="text-lg">{general?.totalOrders}</div>
          </div>
        </Card>
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <div>Sản phẩm</div>
          <div className="flex gap-2 items-center mt-2">
            <ShopTwoTone className="text-4xl" />
            <div className="text-lg">{general?.totalProducts}</div>
          </div>
        </Card>
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <div>Người dùng</div>
          <div className="flex gap-2 items-center mt-2">
            <IdcardTwoTone className="text-4xl" />
            <div className="text-lg">{general?.totalUsers}</div>
          </div>
        </Card>
        <Card className="drop-shadow rounded-sm" bordered={false}>
          <div>Tổng đơn hàng</div>
          <div className="flex gap-2 items-center mt-2">
            <PieChartTwoTone className="text-4xl" />
            <div className="text-lg">1.345</div>
          </div>
        </Card>
      </div>
      <DualAxes {...configDualAxes} />
      <Column {...config} />
      <Divider plain style={{ fontSize: 24 }}>
        Thống kê tháng {new Date().getMonth() + 1}
      </Divider>
      <div className="grid grid-cols-6 gap-8">
        <Card className="shadow-lg rounded-sm" bordered={false}>
          <Statistic
            title="Đơn hàng"
            value={11}
            precision={0}
            valueStyle={{ color: '#3f8600' }}
            prefix={<ArrowUpOutlined />}
          />
        </Card>
        <Card className="col-span-2 shadow-lg rounded-sm" bordered={false}>
          <Statistic
            title="Doanh thu"
            value={formatVND.format(30000000)}
            valueStyle={{ color: '#3f8600' }}
            prefix={<ArrowUpOutlined />}
          />
        </Card>
      </div>
    </div>
  )
}
