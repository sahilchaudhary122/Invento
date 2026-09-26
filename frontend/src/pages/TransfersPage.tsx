import { useState, useMemo } from 'react'
import { Plus, RefreshCw, ArrowLeftRight, XCircle, Loader2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreateTransferModal from '../components/CreateTransferModal'
import { useApiData } from '../hooks/useApiData'
import { transfersApi } from '../api/transfers.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'
import type { InternalTransfer, TransferResponse } from '../types/operations'

export default function TransfersPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => transfersApi.list({ page: 1, size: 50 }))

  const [sessionTransfers, setSessionTransfers] = useState<InternalTransfer[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const backendItems = data?.items ?? null
  const items = backendItems && backendItems.length > 0 ? backendItems : sessionTransfers
  const showSessionList = (isUnavailable || isError || !backendItems) && sessionTransfers.length > 0

  const handleCreateSuccess = (created?: TransferResponse) => {
    if (created) {
      const newTransfer: InternalTransfer = {
        id: created.id,
        reference: created.reference,
        source_location_id: created.source_location_id,
        destination_location_id: created.destination_location_id,
        status: created.status,
        created_at: new Date().toISOString(),
      }
      setSessionTransfers(prev => [newTransfer, ...prev])
    }
    refetch()
  }

  const handleValidate = async (transfer: InternalTransfer) => {
    setActionError(null)
    setActionLoadingId(transfer.id)
    try {
      await transfersApi.validate(transfer.id)
      setSessionTransfers(prev =>
        prev.map(t => (t.id === transfer.id ? { ...t, status: 'VALIDATED' as const } : t))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Transfer validation failed for ${transfer.reference}: ${err.detail}`)
      } else if (err instanceof ApiNotAvailableError) {
        setActionError('Backend API is not reachable.')
      } else {
        setActionError('An unexpected error occurred during transfer validation.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (transfer: InternalTransfer) => {
    if (!window.confirm(`Are you sure you want to cancel transfer ${transfer.reference}?`)) {
      return
    }
    setActionError(null)
    setActionLoadingId(transfer.id)
    try {
      await transfersApi.cancel(transfer.id)
      setSessionTransfers(prev =>
        prev.map(t => (t.id === transfer.id ? { ...t, status: 'CANCELED' as const } : t))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Cancel failed for ${transfer.reference}: ${err.detail}`)
      } else {
        setActionError('Failed to cancel transfer order.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const columns = useMemo<Column<InternalTransfer>[]>(
    () => [
      {
        key: 'reference',
        header: 'Reference',
        render: r => <span className="mono">{r.reference}</span>,
      },
      {
        key: 'source_location_id',
        header: 'From Location',
        render: r => (
          <span className="muted" title={r.source_location_id ?? (r.from_location_id ? String(r.from_location_id) : '')}>
            {r.source_location_name ??
              r.from_location_name ??
              (r.source_location_id
                ? `LOC-${r.source_location_id.substring(0, 8)}...`
                : r.from_location_id
                ? `LOC-${r.from_location_id}`
                : '—')}
          </span>
        ),
      },
      {
        key: 'destination_location_id',
        header: 'To Location',
        render: r => (
          <span className="muted" title={r.destination_location_id ?? (r.to_location_id ? String(r.to_location_id) : '')}>
            {r.destination_location_name ??
              r.to_location_name ??
              (r.destination_location_id
                ? `LOC-${r.destination_location_id.substring(0, 8)}...`
                : r.to_location_id
                ? `LOC-${r.to_location_id}`
                : '—')}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: r => <StatusBadge status={r.status} />,
      },
      {
        key: 'created_at',
        header: 'Created',
        render: r =>
          r.created_at
            ? new Date(r.created_at).toLocaleDateString()
            : <span className="muted">—</span>,
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        render: r => {
          if (r.status === 'DRAFT') {
            const isProcessing = actionLoadingId === r.id
            return (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleValidate(r)}
                  disabled={isProcessing}
                  title="Validate transfer (moves stock from source to destination)"
                  style={{ color: 'var(--status-validated)' }}
                >
                  {isProcessing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <ArrowLeftRight size={13} />
                  )}
                  Validate
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCancel(r)}
                  disabled={isProcessing}
                  title="Cancel draft transfer"
                  style={{ color: 'var(--status-cancelled)' }}
                >
                  <XCircle size={13} />
                  Cancel
                </button>
              </div>
            )
          }
          return <span className="muted">—</span>
        },
      },
    ],
    [actionLoadingId]
  )

  return (
    <>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move stock between warehouse locations. Validate to decrease source stock, increase destination stock, and record audit entries."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh list">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateOpen(true)}
              title="Create new internal transfer"
            >
              <Plus size={14} />
              New Transfer
            </button>
          </>
        }
      />

      {actionError && (
        <div
          className="form-error-banner"
          style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} className="shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-row">
        {(['DRAFT', 'VALIDATED', 'CANCELED'] as const).map(status => (
          <div className="stat-card" key={status}>
            <div className="stat-card-label">{status}</div>
            <div className="stat-card-value">
              {items.filter(r => r.status === status).length}
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading && items.length === 0}
        isUnavailable={showSessionList ? false : isUnavailable}
        isError={showSessionList ? false : isError}
        errorMessage={errorMessage}
        emptyTitle="No internal transfers yet"
        emptyMessage="Create your first internal transfer using the 'New Transfer' button."
        apiEndpoint="GET /api/v1/transfers"
        rowKey={r => r.id}
      />

      {/* Creation Modal */}
      <CreateTransferModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
