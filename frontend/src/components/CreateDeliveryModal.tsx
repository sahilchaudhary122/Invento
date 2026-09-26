import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Truck, AlertCircle, Loader2 } from 'lucide-react'
import { productsApi } from '../api/products.api'
import { warehousesApi } from '../api/warehouses.api'
import { deliveryOrdersApi } from '../api/deliveryOrders.api'
import { ApiResponseError, ApiNotAvailableError } from '../api/client'
import type { Product } from '../types/product'
import type { Location, DeliveryResponse } from '../types/operations'

interface CreateDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (created?: DeliveryResponse) => void
}

interface ItemRow {
  product_id: string
  quantity: number
}

export default function CreateDeliveryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDeliveryModalProps) {
  const [reference, setReference] = useState('')
  const [sourceLocationId, setSourceLocationId] = useState('')
  const [items, setItems] = useState<ItemRow[]>([{ product_id: '', quantity: 1 }])

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
    setItems(prev => [...prev, { product_id: '', quantity: 1 }])
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
      setError('Delivery reference is required.')
      return
    }

    if (!sourceLocationId.trim()) {
      setError('Please select a source location.')
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
      if (!item.quantity || item.quantity <= 0) {
        setError(`Quantity for line #${i + 1} must be greater than zero.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await deliveryOrdersApi.create({
        reference: reference.trim(),
        source_location_id: sourceLocationId.trim(),
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
        })),
      })

      // Reset form state
      setReference('')
      setSourceLocationId('')
      setItems([{ product_id: '', quantity: 1 }])

      onSuccess(res)
      onClose()
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setError(err.detail || 'Failed to create delivery order.')
      } else if (err instanceof ApiNotAvailableError) {
        setError('Backend API is not reachable.')
      } else {
        setError('An unexpected error occurred during delivery order creation.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 620 }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="modal-title">New Delivery Order</h2>
              <p className="modal-subtitle">
                Create an outbound delivery shipment draft
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
              <label className="form-label" htmlFor="delivery-ref">
                Reference *
              </label>
              <input
                id="delivery-ref"
                type="text"
                className="form-input"
                placeholder="e.g. DEL-2026-001"
                value={reference}
                onChange={e => setReference(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="source-location">
                Source Location *
              </label>
              <select
                id="source-location"
                className="form-input"
                value={sourceLocationId}
                onChange={e => setSourceLocationId(e.target.value)}
                disabled={submitting || loadingData}
                required
              >
                <option value="">Select source location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
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
                Delivery Line Items *
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
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={e =>
                        handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 0)
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
                  <Truck size={16} />
                  <span>Create Delivery Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
