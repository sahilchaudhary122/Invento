import { Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { useApiData } from '../hooks/useApiData'
import { receiptsApi } from '../api/receipts.api'
import type { Receipt } from '../types/operations'

const columns: Column<Receipt>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: r => <span className="mono">{r.reference}</span>,
  },
  {
    key: 'supplier',
    header: 'Supplier',
    render: r => <span className="muted">{r.supplier ?? '—'}</span>,
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

export default function ReceiptsPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => receiptsApi.list({ page: 1, size: 50 }))

  const items = data?.items ?? null

  return (
    <>
      <PageHeader
        title="Receipts"
        subtitle="Incoming stock from suppliers. Confirm to update inventory."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" disabled title="Connect backend to create">
              <Plus size={14} />
              New Receipt
            </button>
          </>
        }
      />

      {/* Stats row */}
      <div className="stats-row">
        {(['draft', 'confirmed', 'done', 'cancelled'] as const).map(status => (
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
        emptyTitle="No receipts yet"
        emptyMessage="Create your first receipt when the backend API is connected."
        apiEndpoint="GET /api/v1/receipts"
        rowKey={r => r.id}
      />
    </>
  )
}
