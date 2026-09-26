import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'
import { receiptsApi } from '../api/receipts.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'

interface ValidateReceiptModalProps {
  isOpen: boolean
  receiptId: string | null
  reference?: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function ValidateReceiptModal({
  isOpen,
  receiptId,
  reference,
  onClose,
  onSuccess,
}: ValidateReceiptModalProps) {
  const [locationId, setLocationId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !receiptId) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!locationId.trim()) {
      setError('Destination Location UUID is required.')
      return
    }

    setSubmitting(true)
    try {
      await receiptsApi.validate(receiptId, {
        location_id: locationId.trim(),
      })

      setLocationId('')
      onSuccess()
      onClose()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setError(err.detail || 'Failed to validate receipt.')
      } else if (err instanceof ApiNotAvailableError) {
        setError('Backend API is not reachable.')
      } else {
        setError('An unexpected error occurred during validation.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge" style={{ background: 'var(--status-validated-bg)', color: 'var(--status-validated)' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h2 className="modal-title">Validate Receipt</h2>
              <p className="modal-subtitle">
                {reference ? `Validate draft ${reference}` : 'Process stock receipt'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'var(--bg-muted, rgba(255,255,255,0.03))',
              border: '1px solid var(--border-default)',
              fontSize: '12.5px',
              lineHeight: '1.4',
              color: 'var(--text-muted)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              marginBottom: '14px',
            }}
          >
            <Info size={16} style={{ color: 'var(--status-ready)', flexShrink: 0, marginTop: 2 }} />
            <div>
              Validating this receipt will <strong>increase stock quantities</strong> at the selected destination location and create permanent <strong>Stock Ledger</strong> audit entries.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="destination-location-id">
              Destination Location UUID *
            </label>
            <input
              id="destination-location-id"
              type="text"
              className="form-input mono"
              placeholder="e.g. Location UUID string"
              value={locationId}
              onChange={e => setLocationId(e.target.value)}
              disabled={submitting}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ background: 'var(--status-validated)', borderColor: 'var(--status-validated)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Validate & Move to Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
