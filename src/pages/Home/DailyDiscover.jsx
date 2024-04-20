import { Link } from 'react-router-dom'
import formatter from '../../services/formatter'

export default function DailyDiscover() {
  return (
    <>
      <div className="bg-white shadow-sm">
        <div className="flex justify-center items-center h-12 px-2">
          <div className="uppercase font-bold text-sky-500">Daily Discover</div>
        </div>
        <div className="h-1 bg-sky-600"></div>
      </div>
      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 grid-cols-2 gap-3 p-2">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="relative h-72 bg-white shadow-md hover:border hover:border-sky-500 transition duration-500 hover:-translate-y-1"
          >
            <Link to="/products/product-detail">
              <div className="absolute top-2 bg-orange-600 md:w-2/5 w-1/2 text-center text-white px-0.5 text-xs rounded-e-sm">
                Yêu thích
              </div>
              <div className="absolute end-0 bg-yellow-300 px-0.5 text-xs text-red-500">-2%</div>
              <div className="h-2/3">
                <img
                  className="h-full w-full object-contain"
                  src="https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-Pro-iPhone-14-Pro-Max-gold-220907_inline.jpg.large.jpg"
                  alt=""
                />
              </div>
              <div className="h-1/3 p-2">
                <div className="h-1/2  text-sm overflow-hidden line-clamp-2 text-ellipsis">
                  Apple iPhone 14 Pro Max Apple iPhone 14 Pro Max Apple iPhone 14 Pro Max
                </div>
                <div className="h-1/2 flex justify-between items-end">
                  <div className="text-red-600">{formatter.format(10000000)}</div>
                  <div className="text-xs text-slate-500">3 sold</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center h-16 px-2">
        <Link
          to="/"
          className="text-slate-700 bg-white border border-slate-200 w-1/3 p-2 text-center rounded-sm hover:bg-gray-100"
        >
          See more
        </Link>
      </div>
    </>
  )
}
