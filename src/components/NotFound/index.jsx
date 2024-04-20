import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center mt-28">
      <div>Oops!</div>
      <div className="text-3xl">404 - Page Not Found</div>
      <Link
        type="button"
        className="mt-10 border-2 border-cyan-500 hover:bg-cyan-200 rounded-lg py-1 px-3 m-3"
        to="/"
      >
        Home
      </Link>
    </div>
  )
}
