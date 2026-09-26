import type { Receipt, ReceiptCreate, PaginatedResponse } from '../../types/operations'
import { api } from './client'

export interface ReceiptListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: number
}

/**
 * Receipts API — maps to /api/v1/receipts
 */
export const receiptsApi = {
  list: (params?: ReceiptListParams): Promise<PaginatedResponse<Receipt>> => {
    const q = new URLSearchParams()
    if (params?.page != null) q.set('page', String(params.page))
    if (params?.size != null) q.set('size', String(params.size))
    if (params?.status) q.set('status', params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    return api.get<PaginatedResponse<Receipt>>(`/receipts${qs ? `?${qs}` : ''}`)
  },

  get: (id: number): Promise<Receipt> =>
    api.get<Receipt>(`/receipts/${id}`),

  create: (data: ReceiptCreate): Promise<Receipt> =>
    api.post<Receipt>('/receipts', data),

  confirm: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/confirm`, {}),

  cancel: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/cancel`, {}),

  validate: (id: number): Promise<Receipt> =>
    api.post<Receipt>(`/receipts/${id}/validate`, {}),
}
