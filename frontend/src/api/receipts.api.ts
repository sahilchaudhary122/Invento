import type {
  Receipt,
  ReceiptCreate,
  ReceiptValidate,
  ReceiptResponse,
  PaginatedResponse,
} from '../types/operations'
import { api } from './client'

export interface ReceiptListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: string | number
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

  /** Get a single receipt by ID */
  get: (id: string): Promise<Receipt> =>
    api.get<Receipt>(`/receipts/${id}`),

  /** Create a new draft receipt */
  create: (data: ReceiptCreate): Promise<ReceiptResponse> =>
    api.post<ReceiptResponse>('/receipts', data),

  /** Validate a receipt (moves items into stock at location_id and creates ledger entries) */
  validate: (id: string, data: ReceiptValidate): Promise<ReceiptResponse> =>
    api.post<ReceiptResponse>(`/receipts/${id}/validate`, data),

  /** Cancel a draft receipt */
  cancel: (id: string): Promise<ReceiptResponse> =>
    api.post<ReceiptResponse>(`/receipts/${id}/cancel`, {}),
}
