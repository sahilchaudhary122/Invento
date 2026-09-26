import { useState, useMemo } from 'react'
import { Plus, RefreshCw, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreateAdjustmentModal from '../components/CreateAdjustmentModal'
import { useApiData } from '../hooks/useApiData'
import { adjustmentsApi } from '../api/adjustments.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'
import type { InventoryAdjustment, AdjustmentResponse } from '../types/operations'

export default function AdjustmentsPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => adjustmentsApi.list({ page: 1, size: 50 }))

  const [sessionAdjustments, setSessionAdjustments] = useState<InventoryAdjustment[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const backendItems = data?.items ?? null
  const items = backendItems && backendItems.length > 0 ? backendItems : sessionAdjustments
  const showSessionList = (isUnavailable || isError || !backendItems) && sessionAdjustments.length > 0

  const handleCreateSuccess = (created?: AdjustmentResponse) => {
    if (created) {
      const newAdjustment: InventoryAdjustment = {
        id: created.id,
        reference: created.reference,
        location_id: created.location_id,
        reason: created.reason,
        status: created.status,
        created_at: new Date().toISOString(),
      }
      setSessionAdjustments(prev => [newAdjustment, ...prev])
    }
    refetch()
  }

  const handleValidate = async (adjustment: InventoryAdjustment) => {
    setActionError(null)
    setActionLoadingId(adjustment.id)
    try {
      await adjustmentsApi.validate(adjustment.id)
      setSessionAdjustments(prev =>
        prev.map(a => (a.id === adjustment.id ? { ...a, status: 'VALIDATED' as const } : a))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Adjustment validation failed for ${adjustment.reference}: ${err.detail}`)
      } else if (err instanceof ApiNotAvailableError) {
        setActionError('Backend API is not reachable.')
      } else {
        setActionError('An unexpected error occurred during adjustment validation.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (adjustment: InventoryAdjustment) => {
    if (!window.confirm(`Are you sure you want to cancel adjustment ${adjustment.reference}?`)) {
      return
    }
    setActionError(null)
    setActionLoadingId(adjustment.id)
    try {
      await adjustmentsApi.cancel(adjustment.id)
      setSessionAdjustments(prev =>
        prev.map(a => (a.id === adjustment.id ? { ...a, status: 'CANCELED' as const } : a))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Cancel failed for ${adjustment.reference}: ${err.detail}`)
      } else {
        setActionError('Failed to cancel adjustment order.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const columns = useMemo<Column<InventoryAdjustment>[]>(
    () => [
      {
        key: 'reference',
        header: 'Reference',
        render: r => <span className="mono">{r.reference}</span>,
      },
      {
        key: 'location_id',
        header: 'Target Location',
        render: r => (
          <span className="muted" title={r.location_id}>
            {r.location_name ??
              (r.location_id
                ? `LOC-${r.location_id.substring(0, 8)}...`
                : '—')}
          </span>
        ),
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
                  title="Validate adjustment (applies physical count stock change)"
                  style={{ color: 'var(--status-validated)' }}
                >
                  {isProcessing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  Validate
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCancel(r)}
                  disabled={isProcessing}
                  title="Cancel draft adjustment"
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
        title="Inventory Adjustments"
        subtitle="Correct physical stock counts. Validate to set stock quantity to counted physical units and record audit deltas."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh list">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateOpen(true)}
              title="Create new inventory adjustment"
            >
              <Plus size={14} />
              New Adjustment
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
        emptyTitle="No inventory adjustments yet"
        emptyMessage="Create your first inventory adjustment using the 'New Adjustment' button."
        apiEndpoint="GET /api/v1/adjustments"
        rowKey={r => r.id}
      />

      {/* Creation Modal */}
      <CreateAdjustmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
