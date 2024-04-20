import { Link } from 'react-router-dom'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'

export default function TopProducts({ images }) {
  return (
    <>
      <div className="bg-white shadow-sm">
        <div className="flex justify-between items-center h-12 px-2">
          <div className="uppercase font-bold text-sky-500">Top Products</div>
          <div>
            <Link to="/products/top" className="text-sky-500">
              See All {'>'}
            </Link>
          </div>
        </div>
        <hr />
        <div className="h-60">
          <Slide slidesToShow={5} slidesToScroll={3} autoplay={false}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="each-slide-effect h-48 p-1">
                <div className="bg-contain" style={{ backgroundImage: `url(${images[0]})` }}></div>
              </div>
            ))}
          </Slide>
        </div>
      </div>
    </>
  )
}
