import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, ClipboardList, AlertCircle, Loader2 } from 'lucide-react'
import { productsApi } from '../api/products.api'
import { warehousesApi } from '../api/warehouses.api'
import { adjustmentsApi } from '../api/adjustments.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'
import type { Product } from '../types/product'
import type { Location, AdjustmentResponse } from '../types/operations'

interface CreateAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (created?: AdjustmentResponse) => void
}

interface ItemRow {
  product_id: string
  physical_quantity: number
}

export default function CreateAdjustmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdjustmentModalProps) {
  const [reference, setReference] = useState('')
  const [locationId, setLocationId] = useState('')
  const [reason, setReason] = useState('')
  const [items, setItems] = useState<ItemRow[]>([{ product_id: '', physical_quantity: 0 }])

  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true)
      setError(null)
      Promise.all([productsApi.getProducts(), warehousesApi.getLocations()])
        .then(([prodRes, locRes]) => {
          setProducts(prodRes ?? [])
          setLocations(locRes ?? [])
        })
        .catch(err => {
          if (err instanceof ApiNotAvailableError) {
            setError('Backend API is not reachable to load form data.')
          } else {
            setError('Failed to load products or locations.')
          }
        })
        .finally(() => setLoadingData(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems(prev => [...prev, { product_id: '', physical_quantity: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reference.trim()) {
      setError('Adjustment reference is required.')
      return
    }

    if (!locationId.trim()) {
      setError('Please select a target location.')
      return
    }

    if (!reason.trim()) {
      setError('Adjustment reason is required.')
      return
    }

    if (items.length === 0) {
      setError('At least one item line is required.')
      return
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.product_id) {
        setError(`Please select a product for line #${i + 1}.`)
        return
      }
      if (item.physical_quantity == null || item.physical_quantity < 0) {
        setError(`Physical quantity for line #${i + 1} cannot be negative.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await adjustmentsApi.create({
        reference: reference.trim(),
        location_id: locationId.trim(),
        reason: reason.trim(),
        items: items.map(item => ({
          product_id: item.product_id,
          physical_quantity: Number(item.physical_quantity),
        })),
      })

      // Reset form state
      setReference('')
      setLocationId('')
      setReason('')
      setItems([{ product_id: '', physical_quantity: 0 }])

      onSuccess(res)
      onClose()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setError(err.detail || 'Failed to create inventory adjustment.')
      } else if (err instanceof ApiNotAvailableError) {
        setError('Backend API is not reachable.')
      } else {
        setError('An unexpected error occurred during adjustment creation.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="modal-title">New Inventory Adjustment</h2>
              <p className="modal-subtitle">
                Record physical count audit to correct stock quantities
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="adjustment-ref">
                Reference *
              </label>
              <input
                id="adjustment-ref"
                type="text"
                className="form-input"
                placeholder="e.g. ADJ-2026-001"
                value={reference}
                onChange={e => setReference(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="adjustment-location">
                Target Location *
              </label>
              <select
                id="adjustment-location"
                className="form-input"
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                disabled={submitting || loadingData}
                required
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="adjustment-reason">
              Reason / Audit Notes *
            </label>
            <input
              id="adjustment-reason"
              type="text"
              className="form-input"
              placeholder="e.g. Annual stock audit physical count"
              value={reason}
              onChange={e => setReason(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label className="form-label" style={{ margin: 0 }}>
                Physical Stock Count Items *
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleAddItem}
                disabled={submitting}
                style={{ fontSize: '12px', padding: '2px 8px' }}
              >
                <Plus size={14} /> Add Line
              </button>
            </div>

            {loadingData ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}
              >
                <Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                Loading form resources...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr auto',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      className="form-input"
                      value={item.product_id}
                      onChange={e => handleItemChange(idx, 'product_id', e.target.value)}
                      disabled={submitting}
                      required
                    >
                      <option value="">Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="form-input"
                      placeholder="Physical Count"
                      min="0"
                      value={item.physical_quantity}
                      onChange={e =>
                        handleItemChange(idx, 'physical_quantity', parseInt(e.target.value, 10) || 0)
                      }
                      disabled={submitting}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={submitting || items.length <= 1}
                      title="Remove line"
                      style={{ color: 'var(--status-cancelled)', padding: '6px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions" style={{ marginTop: '20px' }}>
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
              disabled={submitting || loadingData}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Draft...</span>
                </>
              ) : (
                <>
                  <ClipboardList size={16} />
                  <span>Create Adjustment Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
