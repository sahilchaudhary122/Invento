import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const routeLabels: Record<string, string> = {
  '/receipts':        'Receipts',
  '/delivery-orders': 'Delivery Orders',
  '/transfers':       'Internal Transfers',
  '/adjustments':     'Inventory Adjustments',
}

export default function Layout() {
  const location = useLocation()

  // Resolve label from longest matching prefix
  const activeLabel =
    Object.entries(routeLabels)
      .filter(([path]) => location.pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'Operations'

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        {/* Top bar with breadcrumbs & user session */}
        <Navbar activeLabel={activeLabel} />

        {/* Page content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
