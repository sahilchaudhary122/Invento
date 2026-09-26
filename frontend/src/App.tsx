import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ReceiptsPage from './pages/ReceiptsPage'
import DeliveryOrdersPage from './pages/DeliveryOrdersPage'
import TransfersPage from './pages/TransfersPage'
import AdjustmentsPage from './pages/AdjustmentsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Default: redirect to receipts */}
          <Route index element={<Navigate to="/receipts" replace />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="delivery-orders" element={<DeliveryOrdersPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="adjustments" element={<AdjustmentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
