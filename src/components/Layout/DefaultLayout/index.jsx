import Header from '../Header'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { navigateItems } from '../../../routes'
import { useAuth } from '../../../App'

const { Sider, Content } = Layout

export default function DefaultLayout({ children }) {
  const location = useLocation()
  const { state } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [navItems, setNavItems] = useState(navigateItems)

  const regex = location.pathname.match(/^\/[^/]+/)?.at(0) ?? '/'
  const [navSelected, setNavSelected] = useState(regex)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
    sessionStorage.setItem('collapsed', !collapsed)
  }
  const handleMenuClick = ({ key }) => navigate(key)

  useEffect(() => {
    window.scrollTo(0, 0)
    setCollapsed(sessionStorage.getItem('collapsed') === 'true')
  }, [])

  useLayoutEffect(() => {
    if (state.isAuthenticated) setNavItems(navigateItems.filter((e) => e.key !== '/login'))
    else setNavItems(navigateItems)
    setNavSelected(regex)
  }, [state.isAuthenticated, location.pathname, regex])

  return (
    <Layout hasSider>
      <Sider
        width={220}
        trigger={null}
        collapsible
        collapsed={sessionStorage.getItem('collapsed') === 'true' || collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{ position: 'sticky' }}
        className="no-scrollbar overflow-auto h-screen left-0 top-0 bottom-0"
      >
        <Menu
          defaultSelectedKeys={[navSelected]}
          selectedKeys={navSelected}
          mode="inline"
          theme="dark"
          items={navItems}
          onClick={handleMenuClick}
          className="h-full"
        />
      </Sider>
      <Layout>
        <Header collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <Content className="px-4">{children}</Content>
      </Layout>
    </Layout>
  )
}
