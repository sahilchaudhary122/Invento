import { Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { useApiData } from '../hooks/useApiData'
import { transfersApi } from '../api/transfers.api'
import type { InternalTransfer } from '../types/operations'

const columns: Column<InternalTransfer>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: r => <span className="mono">{r.reference}</span>,
  },
  {
    key: 'from_location_name',
    header: 'From Location',
    render: r => r.from_location_name ?? `LOC-${r.from_location_id}`,
  },
  {
    key: 'to_location_name',
    header: 'To Location',
    render: r => r.to_location_name ?? `LOC-${r.to_location_id}`,
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

export default function TransfersPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => transfersApi.list({ page: 1, size: 50 }))

  const items = data?.items ?? null

  return (
    <>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move stock between warehouse locations. Validate to apply changes."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" disabled title="Connect backend to create">
              <Plus size={14} />
              New Transfer
            </button>
          </>
        }
      />

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
        emptyTitle="No transfers yet"
        emptyMessage="Create your first internal transfer when the backend API is connected."
        apiEndpoint="GET /api/v1/transfers"
        rowKey={r => r.id}
      />
    </>
  )
}
