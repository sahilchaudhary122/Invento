import { Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { useApiData } from '../hooks/useApiData'
import { deliveryOrdersApi } from '../api/deliveryOrders.api'
import type { DeliveryOrder } from '../types/operations'

const columns: Column<DeliveryOrder>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: r => <span className="mono">{r.reference}</span>,
  },
  {
    key: 'customer',
    header: 'Customer',
    render: r => <span className="muted">{r.customer ?? '—'}</span>,
  },
  {
    key: 'warehouse_name',
    header: 'Warehouse',
    render: r => r.warehouse_name ?? `WH-${r.warehouse_id}`,
  },
  {
    key: 'status',
    header: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
  {
    key: 'scheduled_date',
    header: 'Scheduled',
    render: r =>
      r.scheduled_date
        ? new Date(r.scheduled_date).toLocaleDateString()
        : <span className="muted">—</span>,
  },
  {
    key: 'created_at',
    header: 'Created',
    render: r => new Date(r.created_at).toLocaleDateString(),
  },
]

export default function DeliveryOrdersPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => deliveryOrdersApi.list({ page: 1, size: 50 }))

  const items = data?.items ?? null

  return (
    <>
      <PageHeader
        title="Delivery Orders"
        subtitle="Outbound shipments to customers. Dispatch to deduct from stock."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" disabled title="Connect backend to create">
              <Plus size={14} />
              New Delivery Order
            </button>
          </>
        }
      />

      <div className="stats-row">
        {(['draft', 'ready', 'done', 'cancelled'] as const).map(status => (
          <div className="stat-card" key={status}>
            <div className="stat-card-label">{status}</div>
            <div className="stat-card-value">
              {isLoading || isUnavailable || isError
                ? '—'
                : (items ?? []).filter(r => r.status === status).length}
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        isUnavailable={isUnavailable}
        isError={isError}
        errorMessage={errorMessage}
        emptyTitle="No delivery orders yet"
        emptyMessage="Create your first delivery order when the backend API is connected."
        apiEndpoint="GET /api/v1/delivery-orders"
        rowKey={r => r.id}
      />
    </>
  )
}
