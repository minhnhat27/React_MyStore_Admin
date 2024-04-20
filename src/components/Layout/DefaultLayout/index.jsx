import Header from '../Header'
import { useEffect } from 'react'
import Sidebar from '../Sidebar'

export default function DefaultLayout({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="w-full flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  )
}
