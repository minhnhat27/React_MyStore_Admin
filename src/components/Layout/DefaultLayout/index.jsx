import Header from '../Header'
import { useEffect, useState } from 'react'
import { App, ConfigProvider, FloatButton, Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { navigateItemsAdmin, navigateItemsEmployee } from '../../../routes'
import { useAuth } from '../../../App'

import viVN from 'antd/locale/vi_VN'
import { AdminRole } from '../../../services/const'

const { Sider, Content } = Layout

export default function DefaultLayout({ children }) {
  const location = useLocation()
  const { state } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const [navItems] = useState(
    state.roles?.includes(AdminRole) ? navigateItemsAdmin : navigateItemsEmployee,
  )

  // const regex = location.pathname.match(/^\/[^/]+/)?.at(0) ?? '/'
  // const [navSelected, setNavSelected] = useState(regex)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
    sessionStorage.setItem('collapsed', !collapsed)
  }
  const handleMenuClick = ({ key }) => navigate(key)

  useEffect(() => {
    window.scrollTo(0, 0)
    setCollapsed(sessionStorage.getItem('collapsed') === 'true')
  }, [])

  // useLayoutEffect(() => {
  //   if (state.isAuthenticated) setNavItems(navigateItems.filter((e) => e.key !== '/'))
  //   else setNavItems(navigateItems)
  //   setNavSelected(regex)
  // }, [state.isAuthenticated, location.pathname, regex])

  return (
    <ConfigProvider locale={viVN}>
      <App notification={{ showProgress: true }}>
        <Layout hasSider>
          <Sider
            width={220}
            trigger={null}
            collapsible
            collapsed={sessionStorage.getItem('collapsed') === 'true' || collapsed}
            breakpoint="md"
            onBreakpoint={(broken) => setCollapsed(broken)}
            style={{ position: 'sticky' }}
            className="no-scrollbar overflow-auto h-screen left-0 top-0 bottom-0 bg-black"
          >
            <Menu
              defaultSelectedKeys={[location.pathname]}
              selectedKeys={`/${location.pathname.split('/')[1]}`}
              mode="inline"
              theme="dark"
              items={navItems}
              onClick={handleMenuClick}
              className="h-full"
            />
          </Sider>
          <Layout>
            <Header collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
            <Content className="px-4 dark:bg-gradient-to-tl from-slate-700 via-black to-slate-900">
              {children}
            </Content>
          </Layout>
        </Layout>
        <FloatButton.BackTop />
      </App>
    </ConfigProvider>
  )
}
