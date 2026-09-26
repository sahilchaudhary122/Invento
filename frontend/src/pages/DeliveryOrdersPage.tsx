import { useState, useMemo } from 'react'
import { Plus, RefreshCw, Send, XCircle, Loader2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreateDeliveryModal from '../components/CreateDeliveryModal'
import { useApiData } from '../hooks/useApiData'
import { deliveryOrdersApi } from '../api/deliveryOrders.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'
import type { DeliveryOrder, DeliveryResponse } from '../types/operations'

export default function DeliveryOrdersPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => deliveryOrdersApi.list({ page: 1, size: 50 }))

  const [sessionDeliveries, setSessionDeliveries] = useState<DeliveryOrder[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const backendItems = data?.items ?? null
  const items = backendItems && backendItems.length > 0 ? backendItems : sessionDeliveries
  const showSessionList = (isUnavailable || isError || !backendItems) && sessionDeliveries.length > 0

  const handleCreateSuccess = (created?: DeliveryResponse) => {
    if (created) {
      const newDelivery: DeliveryOrder = {
        id: created.id,
        reference: created.reference,
        source_location_id: created.source_location_id,
        status: created.status,
        created_at: new Date().toISOString(),
      }
      setSessionDeliveries(prev => [newDelivery, ...prev])
    }
    refetch()
  }

  const handleDispatch = async (delivery: DeliveryOrder) => {
    setActionError(null)
    setActionLoadingId(delivery.id)
    try {
      await deliveryOrdersApi.validate(delivery.id)
      setSessionDeliveries(prev =>
        prev.map(d => (d.id === delivery.id ? { ...d, status: 'VALIDATED' as const } : d))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Dispatch failed for ${delivery.reference}: ${err.detail}`)
      } else if (err instanceof ApiNotAvailableError) {
        setActionError('Backend API is not reachable.')
      } else {
        setActionError('An unexpected error occurred during dispatch.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (delivery: DeliveryOrder) => {
    if (!window.confirm(`Are you sure you want to cancel delivery ${delivery.reference}?`)) {
      return
    }
    setActionError(null)
    setActionLoadingId(delivery.id)
    try {
      await deliveryOrdersApi.cancel(delivery.id)
      setSessionDeliveries(prev =>
        prev.map(d => (d.id === delivery.id ? { ...d, status: 'CANCELED' as const } : d))
      )
      refetch()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setActionError(`Cancel failed for ${delivery.reference}: ${err.detail}`)
      } else {
        setActionError('Failed to cancel delivery order.')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const columns = useMemo<Column<DeliveryOrder>[]>(
    () => [
      {
        key: 'reference',
        header: 'Reference',
        render: r => <span className="mono">{r.reference}</span>,
      },
      {
        key: 'source_location_id',
        header: 'Source Location',
        render: r => (
          <span className="muted" title={r.source_location_id}>
            {r.source_location_name ??
              (r.source_location_id
                ? `LOC-${r.source_location_id.substring(0, 8)}...`
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
                  onClick={() => handleDispatch(r)}
                  disabled={isProcessing}
                  title="Dispatch delivery order (deducts stock)"
                  style={{ color: 'var(--status-ready)' }}
                >
                  {isProcessing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Dispatch
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCancel(r)}
                  disabled={isProcessing}
                  title="Cancel draft delivery"
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
        title="Delivery Orders"
        subtitle="Outbound shipments to customers. Dispatch to deduct from inventory stock."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh list">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateOpen(true)}
              title="Create new delivery order"
            >
              <Plus size={14} />
              New Delivery Order
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
        emptyTitle="No delivery orders yet"
        emptyMessage="Create your first outbound delivery order using the 'New Delivery Order' button."
        apiEndpoint="GET /api/v1/deliveries"
        rowKey={r => r.id}
      />

      {/* Creation Modal */}
      <CreateDeliveryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
