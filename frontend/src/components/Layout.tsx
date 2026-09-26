import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ChevronRight } from 'lucide-react'

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
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>Invento</span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span>Operations</span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="active">{activeLabel}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
