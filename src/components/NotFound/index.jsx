import { Button } from 'antd'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold">Oops!</div>
        <div className="text-3xl">404 - Page Not Found</div>
        <div>
          <Link to={-1}>
            <Button type="primary">Go Back</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
