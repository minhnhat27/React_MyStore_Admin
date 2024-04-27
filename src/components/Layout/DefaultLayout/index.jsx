import Header from '../Header'
import { useEffect, useState } from 'react'
import Sidebar from '../Sidebar'

export default function DefaultLayout({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [showSidebar, setShowSidebar] = useState(true)
  const toggleSidebar = () => setShowSidebar(!showSidebar)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <div className="flex">
        {showSidebar && <Sidebar toggleSidebar={toggleSidebar} showSidebar={showSidebar} />}
        <div className="w-full flex flex-col min-h-screen">
          <Header toggleSidebar={toggleSidebar} showSidebar={showSidebar} />
          <div className="flex-1 bg-slate-100 px-5">{children}</div>
        </div>
      </div>
    </>
  )
}
