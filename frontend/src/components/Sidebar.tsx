import { NavLink, useLocation } from 'react-router-dom'
import {
  PackageCheck,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  Boxes,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const operationsNav: NavItem[] = [
  { to: '/receipts',        label: 'Receipts',              icon: <PackageCheck size={16} /> },
  { to: '/delivery-orders', label: 'Delivery Orders',       icon: <Truck size={16} /> },
  { to: '/transfers',       label: 'Internal Transfers',    icon: <ArrowLeftRight size={16} /> },
  { to: '/adjustments',     label: 'Inventory Adjustments', icon: <ClipboardList size={16} /> },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Boxes size={18} color="#fff" />
        </div>
        <div>
          <div className="sidebar-brand-name">Invento</div>
          <div className="sidebar-brand-sub">Operations</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Operations</div>
          {operationsNav.map(item => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-item${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </NavLink>
            )
          })}
        </div>

        {/* Placeholder section for future modules */}
        <div className="sidebar-section" style={{ marginTop: '8px' }}>
          <div className="sidebar-section-label">Configuration</div>
          <div
            className="sidebar-item"
            style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}
          >
            <span className="sidebar-item-icon"><Boxes size={16} /></span>
            <span>Warehouses</span>
            <span
              style={{
                fontSize: '10px',
                background: 'var(--border-default)',
                padding: '1px 6px',
                borderRadius: '99px',
                color: 'var(--text-muted)',
              }}
            >
              Soon
            </span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">feature/operations</div>
        <div className="sidebar-footer-text" style={{ marginTop: 2 }}>Member 3 · M3</div>
      </div>
    </aside>
  )
}
