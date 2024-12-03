import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Image,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Upload,
  App,
  Flex,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import {
  CheckOutlined,
  CloseOutlined,
  HomeFilled,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import productService from '../../services/products/productService'
import {
  gender,
  getBase64,
  isEmptyObject,
  toImageSrc,
  showError,
  toTextLabel,
} from '../../services/commonService'
import { Link, useParams } from 'react-router-dom'
import BreadcrumbLink from '../../components/BreadcrumbLink'
import httpService from '../../services/http-service'
import { PRODUCT_API } from '../../services/const'

const breadcrumbItems = (id) => [
  { path: '/', title: <HomeFilled /> },
  {
    path: '/products-management',
    title: 'Sản phẩm',
  },
  {
    title: `Chi tiết sản phẩm #${id}`,
  },
]

export default function ProductDetail() {
  const { id } = useParams()
  const { message } = App.useApp()

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const [productAttributes, setProductAttributes] = useState({})
  const [update, setUpdate] = useState(false)

  const [sizeList, setSizeList] = useState([])
  const [sizeListValue, setSizeListValue] = useState([])

  const [fileList, setFileList] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const [colorImages, setColorImages] = useState([])
  const colors = Form.useWatch('colors', form) || []

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }
  const handleChangeFile = ({ fileList: newFileList }) => setFileList(newFileList)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const pAttr = await productService.fetchProductAttributes()
        Object.keys(pAttr).forEach((key) => (pAttr[key] = toTextLabel(pAttr[key])))
        setProductAttributes(pAttr)

        const data = await httpService.get(PRODUCT_API + `/${id}`)
        form.setFieldsValue(data)

        const sizeIds = data.colorSizes[0].sizeInStocks?.map((item) => item.sizeId)
        form.setFieldValue('sizes', sizeIds)

        const sizes = data.colorSizes[0].sizeInStocks?.map((item) => ({
          sizeId: item.sizeId,
          label: pAttr.sizes.find((e) => e.id === item.sizeId)?.label,
        }))
        setSizeList(sizes)
        setSizeListValue(data.colorSizes)

        const colors = data.colorSizes.map((item) => ({
          id: item.id,
          colorName: item.colorName,
          image: item.imageUrl,
        }))
        form.setFieldValue('colors', colors)

        const colorFiles = data.colorSizes?.map((item) => ({
          originUrl: item.imageUrl,
          url: toImageSrc(item.imageUrl),
          name: item.imageUrl.substring(item.imageUrl.lastIndexOf('\\') + 1),
        }))

        setColorImages(colorFiles)

        const files = data.imageUrls?.map((item) => ({
          originUrl: item,
          url: toImageSrc(item),
        }))
        setFileList(files)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, form, message])

  const handleChangeColorFile = ({ fileList: newFileList }, key) => {
    const colors = [...colorImages]
    colors[key] = newFileList[0]
    setColorImages(colors)
  }

  const handleSelectSize = (listSizeId, valueLabelObj) => {
    setSizeList(valueLabelObj.map((item) => ({ sizeId: item.value, label: item.label })))

    const newL = colors.map((color) => {
      const sizeInStocks = listSizeId.map((sizeId) => {
        const exist = sizeListValue
          ?.find((e) => e.colorName === color?.colorName)
          ?.sizeInStocks?.find((e) => e.sizeId === sizeId)

        if (exist) {
          return { ...exist }
        } else return { sizeId: sizeId }
      })
      return { colorName: color.colorName, id: color.id, sizeInStocks: sizeInStocks }
    })

    // const newList = colors.map((color) => {
    //   const exist = sizeListValue.find((e) => e.colorName === color?.colorName)
    //   if (exist) {
    //     const updatedSizeInStocks = [...exist.sizeInStocks]
    //     listSizeId.forEach((sizeId) => {
    //       const sizeExists = updatedSizeInStocks.some((stock) => stock.sizeId === sizeId)
    //       if (!sizeExists) updatedSizeInStocks.push({ sizeId: sizeId })
    //     })
    //     return { ...exist, sizeInStocks: updatedSizeInStocks }
    //   } else {
    //     const sizeInStocks = listSizeId.map((sizeId) => ({ sizeId: sizeId }))
    //     return { colorName: color.colorName, sizeInStocks: sizeInStocks }
    //   }
    // })
    setSizeListValue(newL)
  }

  const handleSetSizeValue = (obj, index) => {
    const newList = [...sizeListValue]
    const sizeInStocks = newList[index].sizeInStocks.find((e) => e.sizeId === obj.sizeId)

    if (sizeInStocks) sizeInStocks.inStock = obj.inStock

    setSizeListValue(newList)
  }

  const onChangeColor = (value, index) => {
    if (sizeList.length > 0) {
      const newList = [...sizeListValue]
      if (newList[index]?.colorName) {
        newList[index].colorName = value
      } else {
        newList[index] = {}
        newList[index].colorName = value

        sizeList.forEach((item) => {
          if (!newList[index]?.sizeInStocks) newList[index].sizeInStocks = []
          if (!newList[index]?.sizeInStocks?.some((e) => e.sizeId === item.sizeId)) {
            newList[index].sizeInStocks.push({ sizeId: item.sizeId })
          }
        })
      }
      setSizeListValue(newList)
    }
  }

  const handleRemoveColor = (index, key) => {
    const newImages = [...colorImages]
    newImages[key] = null
    setColorImages(newImages)

    if (colors.length === 1) {
      setSizeList([])
      form.setFieldValue('sizes', [])
    }
    const newList = [...sizeListValue]
    setSizeListValue(newList.filter((_, i) => i !== index))
  }

  const updateProduct = async (values) => {
    try {
      setUpdateLoading(true)
      const formData = new FormData()

      fileList
        .reverse()
        .forEach((item, i) =>
          item.originFileObj
            ? formData.append(`images`, item.originFileObj)
            : formData.append(`imageUrls[${i}]`, item.originUrl),
        )

      const data = {
        ...values,
        enable: values.enable ?? true,
        description: values.description ?? '',
        discountPercent: values.discountPercent ?? 0,
      }
      delete data.imageUrls
      delete data.sizes

      data.materialIds.forEach((id, i) => formData.append(`materialIds[${i}]`, id))
      delete data.materialIds

      sizeListValue.forEach((color, index) => {
        formData.append(`colorSizes[${index}].colorName`, color.colorName)
        formData.append(`colorSizes[${index}].id`, color.id)

        if (colors[index]?.image[0]?.originFileObj) {
          formData.append(`colorSizes[${index}].image`, colors[index]?.image[0]?.originFileObj)
          if (!color.id) formData.delete(`colorSizes[${index}].id`)
        }

        color.sizeInStocks.forEach((size, sizeIndex) => {
          formData.append(`colorSizes[${index}].sizeInStocks[${sizeIndex}].sizeId`, size.sizeId)
          formData.append(`colorSizes[${index}].sizeInStocks[${sizeIndex}].inStock`, size.inStock)
        })
      })
      delete data.colors

      Object.keys(data).forEach((key) => formData.append(key, data[key]))

      try {
        await httpService.put(PRODUCT_API + `/${id}`, formData)
        message.success('Thành công')
        setUpdate(false)
      } catch (error) {
        message.error(showError(error))
      } finally {
        setUpdateLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="pb-4">
        <BreadcrumbLink breadcrumbItems={breadcrumbItems(id)} />
        <Form
          form={form}
          disabled={updateLoading}
          onValuesChange={() => setUpdate(true)}
          onFinish={updateProduct}
          layout="vertical"
          className="grid gap-3 grid-cols-1 md:grid-cols-2"
        >
          <Card loading={loading} className="drop-shadow h-fit">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input showCount maxLength={150} size="large" placeholder="Abc..." />
            </Form.Item>
            <div className="grid gap-2 md:grid-cols-3">
              <Form.Item
                label="Thương hiệu"
                name="brandId"
                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  showSearch
                  placeholder="Chọn"
                  options={productAttributes.brands}
                />
              </Form.Item>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  loading={loading}
                  className="w-full"
                  size="large"
                  optionFilterProp="label"
                  showSearch
                  placeholder="Chọn"
                  options={productAttributes.categories}
                />
              </Form.Item>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select className="w-full" size="large" placeholder="Chọn" options={gender} />
              </Form.Item>
            </div>
            <Form.Item
              label="Chất liệu"
              name="materialIds"
              rules={[{ required: true, message: 'Chọn ít nhất 1 chất liệu' }]}
            >
              <Select
                loading={loading}
                className="w-full"
                mode="multiple"
                size="large"
                optionFilterProp="label"
                placeholder="Chọn chất liệu"
                options={productAttributes.materials}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  min={0}
                  size="large"
                  className="w-full col-span-2"
                  formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Price..."
                />
              </Form.Item>
              <Form.Item label="Phần trăm giảm giá" name="discountPercent">
                <InputNumber
                  size="large"
                  min={0}
                  max={90}
                  className="w-full"
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace('%', '')}
                  placeholder="5, 10,..."
                />
              </Form.Item>
            </div>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <TextArea
                id="description"
                autoSize={{ minRows: 6 }}
                showCount
                placeholder="Áo đẹp..."
                maxLength={5000}
              />
            </Form.Item>
          </Card>
          <Card loading={loading} className="drop-shadow h-fit">
            <Form.Item
              label="Hình ảnh chung"
              name="imageUrls"
              rules={[{ required: true, message: 'Tối thiểu 1 ảnh' }]}
              getValueFromEvent={(e) => e.fileList}
            >
              <Upload
                maxCount={4}
                beforeUpload={() => false}
                listType="picture-card"
                fileList={fileList}
                accept="image/png, image/gif, image/jpeg, image/svg, image/webp"
                multiple
                onPreview={handlePreview}
                onChange={handleChangeFile}
              >
                {fileList.length >= 4 ? null : (
                  <button type="button">
                    <PlusOutlined />
                    <div>Tải lên</div>
                  </button>
                )}
              </Upload>
            </Form.Item>
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

            <Form.List
              name="colors"
              rules={[
                {
                  validator: async (_, colors) => {
                    if (!colors || colors.length < 1) {
                      return Promise.reject(new Error('Vui lòng thêm ít nhất 1 màu'))
                    } else {
                      const colorValues = colors
                        .map((item) => item?.colorName?.toLowerCase())
                        .filter((value) => value !== undefined)

                      if (new Set(colorValues).size !== colorValues.length) {
                        return Promise.reject(new Error('Các màu không được trùng nhau'))
                      }
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => {
                    const file = colorImages[key] ? [colorImages[key]] : []
                    return (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <Flex align="baseline" gap={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'colorName']}
                            rules={[{ required: true, message: 'Vui lòng nhập màu' }]}
                          >
                            <Input
                              className="w-full"
                              onChange={(e) => onChangeColor(e.target.value, index)}
                              size="large"
                              placeholder="Đen, Trắng,..."
                            />
                          </Form.Item>
                          <MinusCircleOutlined
                            className="inline-flex"
                            onClick={() => {
                              remove(name)
                              handleRemoveColor(index, key)
                            }}
                          />
                        </Flex>
                        <Form.Item
                          name={[name, 'image']}
                          rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
                          getValueFromEvent={(e) => e.fileList}
                        >
                          <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            listType="text"
                            fileList={file}
                            accept="image/png, image/gif, image/jpeg, image/svg, image/webp"
                            onPreview={handlePreview}
                            onChange={(e) => handleChangeColorFile(e, key)}
                          >
                            {colorImages[key] ? null : (
                              <Button type="link">
                                <PlusOutlined />
                                <span>Tải ảnh lên</span>
                              </Button>
                            )}
                          </Upload>
                        </Form.Item>
                      </div>
                    )
                  })}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm màu
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item
              label="Size"
              name="sizes"
              rules={[{ required: true, message: 'Vui lòng chọn size' }]}
              className="space-y-2"
            >
              <Select
                className="w-full"
                size="large"
                optionFilterProp="label"
                placeholder="Thêm size"
                onChange={handleSelectSize}
                options={productAttributes.sizes}
                autoClearSearchValue
                mode="multiple"
                disabled={
                  colors.length <= 0 ||
                  colors.some((color) => color === undefined || !color?.colorName) ||
                  updateLoading
                }
              />
            </Form.Item>
            {/* {console.log(sizeListValue)} */}
            <div className="grid grid-cols-2 gap-2">
              {sizeList.map((size, i) => (
                <Form.Item label={size.label} key={i} className="mb-2">
                  {colors.map((color, j) => {
                    if (color && color.colorName !== '') {
                      return (
                        <div key={j} className="mb-2 grid grid-cols-2 gap-2">
                          <div className="truncate border rounded-md px-2 py-1 text-center">
                            {color?.colorName}
                          </div>
                          <InputNumber
                            required
                            min={0}
                            className="w-full"
                            value={
                              sizeListValue
                                .find((e) => e.colorName === color?.colorName)
                                ?.sizeInStocks?.find((e) => e.sizeId === size.sizeId)?.inStock
                            }
                            onChange={(value) => {
                              handleSetSizeValue(
                                {
                                  sizeId: size.sizeId,
                                  colorName: color.colorName,
                                  inStock: value,
                                },
                                j,
                              )
                              setUpdate(true)
                            }}
                            placeholder="Số lượng kho..."
                          />
                        </div>
                      )
                    }
                    return null
                  })}
                </Form.Item>
              ))}
            </div>
            <Form.Item
              label="Kích hoạt sản phẩm"
              className="mt-2"
              name="enable"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
                className="bg-gray-500"
              />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                disabled={isEmptyObject(productAttributes) || !update || updateLoading}
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
                onClick={() =>
                  form.validateFields().catch((errorInfo) => {
                    const firstErrorField =
                      errorInfo.errorFields?.[0]?.errors?.[0] || 'Vui lòng điền đầy đủ thông tin'
                    message.error(firstErrorField)
                  })
                }
              >
                {updateLoading ? <Spin /> : 'Cập nhật'}
              </Button>

              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimaryHover: 'rgb(156, 163, 175)',
                    },
                  },
                }}
              >
                <Link to={-1}>
                  <Button type="primary" className="w-full bg-gray-500" size="large">
                    Trở về
                  </Button>
                </Link>
              </ConfigProvider>
            </div>
          </Card>
        </Form>
      </div>
    </>
  )
}
