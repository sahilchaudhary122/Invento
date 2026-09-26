import { useState, useMemo } from 'react'
import { Plus, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { Column } from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import CreateReceiptModal from '../components/CreateReceiptModal'
import ValidateReceiptModal from '../components/ValidateReceiptModal'
import { useApiData } from '../hooks/useApiData'
import { receiptsApi } from '../api/receipts.api'
import type { Receipt } from '../types/operations'

export default function ReceiptsPage() {
  const { data, isLoading, isUnavailable, isError, errorMessage, refetch } =
    useApiData(() => receiptsApi.list({ page: 1, size: 50 }))

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [validatingReceipt, setValidatingReceipt] = useState<{
    id: string
    reference?: string
  } | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const items = data?.items ?? null

  const handleCancel = async (receipt: Receipt) => {
    if (!window.confirm(`Are you sure you want to cancel receipt ${receipt.reference}?`)) {
      return
    }
    setCancelingId(receipt.id)
    try {
      await receiptsApi.cancel(receipt.id)
      refetch()
    } catch {
      alert('Failed to cancel receipt.')
    } finally {
      setCancelingId(null)
    }
  }

  const columns = useMemo<Column<Receipt>[]>(
    () => [
      {
        key: 'reference',
        header: 'Reference',
        render: r => <span className="mono">{r.reference}</span>,
      },
      {
        key: 'supplier',
        header: 'Supplier',
        render: r => (
          <span className="muted" title={r.supplier_id}>
            {r.supplier ?? (r.supplier_id ? `${r.supplier_id.substring(0, 8)}...` : '—')}
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
            const isCanceling = cancelingId === r.id
            return (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setValidatingReceipt({ id: r.id, reference: r.reference })}
                  title="Validate stock receipt"
                  style={{ color: 'var(--status-validated)' }}
                >
                  <CheckCircle2 size={13} />
                  Validate
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCancel(r)}
                  disabled={isCanceling}
                  title="Cancel draft receipt"
                  style={{ color: 'var(--status-cancelled)' }}
                >
                  {isCanceling ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <XCircle size={13} />
                  )}
                  Cancel
                </button>
              </div>
            )
          }
          return <span className="muted">—</span>
        },
      },
    ],
    [cancelingId]
  )

  return (
    <>
      <PageHeader
        title="Receipts"
        subtitle="Incoming stock from suppliers. Validate draft receipts to update stock inventory."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={refetch} title="Refresh list">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateOpen(true)}
              title="Create new draft receipt"
            >
              <Plus size={14} />
              New Receipt
            </button>
          </>
        }
      />

      {/* Stats row */}
      <div className="stats-row">
        {(['DRAFT', 'VALIDATED', 'CANCELED'] as const).map(status => (
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
        emptyMessage="Create your first receipt draft using the 'New Receipt' button above."
        apiEndpoint="GET /api/v1/receipts"
        rowKey={r => r.id}
      />

      {/* Creation Modal */}
      <CreateReceiptModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      {/* Validation Modal */}
      <ValidateReceiptModal
        isOpen={Boolean(validatingReceipt)}
        receiptId={validatingReceipt?.id ?? null}
        reference={validatingReceipt?.reference}
        onClose={() => setValidatingReceipt(null)}
        onSuccess={refetch}
      />
    </>
  )
}
