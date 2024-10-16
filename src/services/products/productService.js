import httpService from '../http-service'
import { BRAND_API, CATEGORY_API, MATERIAL_API, SIZE_API } from '../const'

const fetchProductAttributes = async () => {
  try {
    const brandsData = httpService.get(BRAND_API)
    const materialsData = httpService.get(MATERIAL_API)
    const categoriesData = httpService.get(CATEGORY_API)
    const sizesData = httpService.get(SIZE_API)

    const [brands, materials, categories, sizes] = await Promise.all([
      brandsData,
      materialsData,
      categoriesData,
      sizesData,
    ])
    const data = {
      brands: brands,
      materials: materials,
      categories: categories,
      sizes: sizes,
    }
    return data
  } catch (error) {
    return new Error(error)
  }
}

const productService = {
  fetchProductAttributes,
}
export default productService
