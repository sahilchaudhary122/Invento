import type { Receipt, ReceiptCreate, PaginatedResponse } from '../types/operations'
import { api } from './client'

export interface ReceiptListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: number
}

/**
 * Receipts API — maps to /api/v1/receipts
 * All methods throw ApiNotAvailableError or ApiResponseError on failure.
 */
export const receiptsApi = {
  /** List receipts with optional filters */
  list: (params?: ReceiptListParams): Promise<PaginatedResponse<Receipt>> => {
    const q = new URLSearchParams()
    if (params?.page   != null) q.set('page',         String(params.page))
    if (params?.size   != null) q.set('size',         String(params.size))
    if (params?.status        ) q.set('status',       params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    return api.get<PaginatedResponse<Receipt>>(`/receipts${qs ? `?${qs}` : ''}`)
  },

  /** Get a single receipt by ID (includes lines) */
  get: (id: number): Promise<Receipt> =>
    api.get<Receipt>(`/receipts/${id}`),

  /** Create a new receipt */
  create: (data: ReceiptCreate): Promise<Receipt> =>
    api.post<Receipt>('/receipts', data),

  /** Confirm a draft receipt */
  confirm: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/confirm`, {}),

  /** Cancel a receipt */
  cancel: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/cancel`, {}),

  /** Mark receipt as done (all lines received) */
  validate: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/validate`, {}),
}
