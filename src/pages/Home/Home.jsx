import { App, Button, Card, Divider, Form, Image, Skeleton, Statistic, Upload } from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ExclamationCircleTwoTone,
  IdcardTwoTone,
  PieChartTwoTone,
  PlusOutlined,
  ShopTwoTone,
} from '@ant-design/icons'
import { formatVND, getBase64, showError, toImageSrc } from '../../services/commonService'
import { DualAxes } from '@ant-design/charts'
import { HOME_API, STATISTICS_API } from '../../services/const'
import { useEffect, useMemo, useState } from 'react'
import httpService from '../../services/http-service'

export default function Home() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [monthLoading, setMonthLoading] = useState(false)
  const [general, setGeneral] = useState()
  const { message } = App.useApp()

  const [revenueThisYear, setRevenueThisYear] = useState([])
  const [revenueThisMonth, setRevenueThisMonth] = useState({})
  const [revenuePrevMonth, setRevenuePrevMonth] = useState({})
  const [total, setTotal] = useState(0)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [fileList, setFileList] = useState([])

  const [disabled, setDisabled] = useState(true)

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear()
        const data = await httpService.get(`${STATISTICS_API}/revenue/${year}`)
        const updatedData = data.statistics.map((item) => ({
          month: item.month,
          'Doanh thu': item.revenue,
          'Tổng đơn hàng': item.totalOrders,
        }))
        setRevenueThisYear(updatedData)

        setTotal(data.total)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setMonthLoading(true)
        const year = new Date().getFullYear()
        const month = new Date().getMonth() + 1
        const data = await httpService.get(`${STATISTICS_API}/revenue/${year}/${month}`)
        setRevenueThisMonth(data)
      } catch (error) {
        console.log(error)
      } finally {
        setMonthLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setMonthLoading(true)
        const year = new Date().getFullYear()

        const date = new Date()
        const previousMonth = new Date(date.getTime())
        previousMonth.setDate(0)

        const data = await httpService.get(
          `${STATISTICS_API}/revenue/${year}/${previousMonth.getMonth() + 1}`,
        )
        setRevenuePrevMonth(data)
      } catch (error) {
        console.log(error)
      } finally {
        setMonthLoading(false)
      }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setImageLoading(true)
        const data = await httpService.get(`${HOME_API}/banner`)
        const files = data?.map((item) => ({
          originUrl: item,
          url: toImageSrc(item),
        }))
        setFileList(files)
      } catch (error) {
      } finally {
        setImageLoading(false)
      }
    }
    fetchData()
  }, [])

  const configDualAxes = {
    xField: 'month',
    data: revenueThisYear,
    legend: {
      color: {
        itemMarker: (v) => {
          if (v === 'Doanh thu') return 'rect'
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
        yField: 'Doanh thu',
        axis: { y: { labelFormatter: (d) => formatVND.format(d) } },
        tooltip: {
          items: [{ channel: 'y', valueFormatter: (d) => formatVND.format(d) }],
        },
      },
      {
        type: 'line',
        yField: 'Tổng đơn hàng',
        shapeField: 'smooth',
        scale: { color: { relations: [['Tổng đơn hàng', '#fdae6b']] } },
        axis: { y: { position: 'right' } },
        style: { lineWidth: 2 },
      },
    ],
  }

  const onChangeBanner = async ({ fileList: newFileList }) => {
    setFileList(newFileList)
    setDisabled(false)
  }

  const handleChangeBanner = async (values) => {
    try {
      const formData = new FormData()
      values?.images
        .filter((e) => e.originUrl)
        .forEach((file, i) => formData.append(`imageUrls[${i}]`, file.originUrl))

      values?.images.forEach(
        (file) => file.originFileObj && formData.append('images', file.originFileObj),
      )

      await httpService.put(`${HOME_API}/banner`, formData)
      message.success('Cập thành công')
    } catch (error) {
      message.error(showError(error))
    }
  }

  const beforeUpload = (file) => {
    const isLt1MB = file.size / 1024 / 1024 >= 1
    if (!isLt1MB) {
      message.error('Ảnh phải từ 1MB trở lên!')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const uploadButton = (
    <button type="button">
      <PlusOutlined />
      <div className="mt-2">Tải lên</div>
    </button>
  )

  const totalOrdersComparedToLastMonth = useMemo(
    () => revenueThisMonth.totalOrders - revenuePrevMonth.totalOrders,
    [revenueThisMonth.totalOrders, revenuePrevMonth.totalOrders],
  )

  const revenueComparedToLastMonth = useMemo(
    () => revenueThisMonth.revenue - revenuePrevMonth.revenue,
    [revenueThisMonth.revenue, revenuePrevMonth.revenue],
  )

  return (
    <div className="py-2 md:p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <Statistic
            title="Tổng đơn hàng"
            value={general?.totalOrders ?? 0}
            precision={0}
            prefix={<PieChartTwoTone className="text-4xl" />}
          />
        </Card>
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <Statistic
            title="Sản phẩm"
            value={general?.totalProducts ?? 0}
            precision={0}
            prefix={<ShopTwoTone className="text-4xl" />}
          />
        </Card>
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <Statistic
            title="Người dùng"
            value={general?.totalProducts ?? 0}
            precision={0}
            prefix={<IdcardTwoTone className="text-4xl" />}
          />
        </Card>
        <Card loading={loading} className="drop-shadow rounded-sm" bordered={false}>
          <Statistic
            title="Đơn bị hủy"
            value={general?.totalCanceledOrders ?? 0}
            precision={0}
            prefix={<ExclamationCircleTwoTone className="text-4xl" />}
          />
        </Card>
      </div>
      <Divider plain style={{ fontSize: 18 }}>
        Doanh thu năm {new Date().getFullYear()}
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="md:col-span-3 h-72 md:h-[50vh] flex-1">
          <DualAxes {...configDualAxes} />
        </div>
        <Card className="self-center shadow-lg rounded-sm h-fit" bordered={false}>
          <Statistic
            title="Tổng doanh thu"
            value={formatVND.format(total)}
            valueStyle={{ color: 'green' }}
          />
        </Card>
      </div>
      <Divider plain style={{ fontSize: 18 }}>
        Thống kê tháng {new Date().getMonth() + 1}
      </Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <Card loading={monthLoading} className="shadow-lg rounded-sm" bordered={false}>
          <Statistic
            title="Đơn hàng"
            value={revenueThisMonth.totalOrders}
            precision={0}
            valueStyle={{ color: totalOrdersComparedToLastMonth > 0 ? '#3f8600' : 'red' }}
            prefix={
              totalOrdersComparedToLastMonth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
            }
            suffix={
              <div className="text-sm">
                {(totalOrdersComparedToLastMonth > 0 ? 'Tăng ' : 'Giảm ') +
                  Math.abs(totalOrdersComparedToLastMonth) +
                  ' so với tháng trước'}
              </div>
            }
          />
        </Card>
        <Card loading={monthLoading} className="shadow-lg rounded-sm" bordered={false}>
          <Statistic
            title="Doanh thu"
            value={formatVND.format(revenueThisMonth.revenue)}
            valueStyle={{ color: revenueComparedToLastMonth > 0 ? '#3f8600' : 'red' }}
            prefix={revenueComparedToLastMonth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix={
              <div className="text-sm">
                {(totalOrdersComparedToLastMonth > 0 ? 'Tăng ' : 'Giảm ') +
                  Math.abs(
                    (revenueComparedToLastMonth /
                      (revenuePrevMonth.revenue || revenueComparedToLastMonth)) *
                      100,
                  ).toFixed(0) +
                  '% so với tháng trước'}
              </div>
            }
          />
        </Card>
      </div>
      <div>
        <Divider plain style={{ fontSize: 18 }}>
          Ảnh trang chủ
        </Divider>
        <Form
          onChange={() => setDisabled(false)}
          layout="horizontal"
          form={form}
          onFinish={handleChangeBanner}
        >
          {imageLoading ? (
            [...new Array(10)].map((_, i) => <Skeleton.Image className="m-1" key={i} active />)
          ) : (
            <Form.Item
              getValueFromEvent={(e) => e.fileList}
              name="images"
              rules={[{ required: true, message: 'Chọn ít nhất 1 ảnh' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                multiple
                listType="picture-card"
                accept="image/png, image/gif, image/jpeg, image/svg, image/webp"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={onChangeBanner}
                maxCount={10}
              >
                {fileList.length >= 10 ? null : uploadButton}
              </Upload>
            </Form.Item>
          )}

          {previewImage && (
            <Image
              wrapperStyle={{
                display: 'none',
              }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
          {imageLoading || (
            <Form.Item>
              <Button disabled={disabled} htmlType="submit" type="primary">
                Xác nhận
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
    </div>
  )
}
