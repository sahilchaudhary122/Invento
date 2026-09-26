import { Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { useApiData } from '../hooks/useApiData'
import { adjustmentsApi } from '../api/adjustments.api'
import type { InventoryAdjustment } from '../types/operations'

const columns: Column<InventoryAdjustment>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: r => <span className="mono">{r.reference}</span>,
  },
  {
    key: 'warehouse_name',
    header: 'Warehouse',
    render: r => r.warehouse_name ?? `WH-${r.warehouse_id}`,
  },
  {
    key: 'reason',
    header: 'Reason',
    render: r => <span className="muted">{r.reason ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: r => <StatusBadge status={r.status} />,
  },
  {
    key: 'lines',
    header: 'Lines',
    render: r => (
      <span className="muted">{r.lines?.length ?? '—'}</span>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    render: r => new Date(r.created_at).toLocaleDateString(),
  },
]

export default function AdjustmentsPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => adjustmentsApi.list({ page: 1, size: 50 }))

  const items = data?.items ?? null

  return (
    <>
      <PageHeader
        title="Inventory Adjustments"
        subtitle="Correct physical stock counts. Validate to apply quantity deltas."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" disabled title="Connect backend to create">
              <Plus size={14} />
              New Adjustment
            </button>
          </>
        }
      />

      <div className="stats-row">
        {(['draft', 'validated', 'cancelled'] as const).map(status => (
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
        emptyTitle="No adjustments yet"
        emptyMessage="Create your first inventory adjustment when the backend API is connected."
        apiEndpoint="GET /api/v1/adjustments"
        rowKey={r => r.id}
      />
    </>
  )
}
