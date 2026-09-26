import type {
  InternalTransfer,
  InternalTransferCreate,
  TransferResponse,
  PaginatedResponse,
} from '../types/operations'
import { api } from './client'

export interface TransferListParams {
  page?: number
  size?: number
  status?: string
}

/**
 * Internal Transfers API — maps to /api/v1/transfers
 */
export const transfersApi = {
  list: (params?: TransferListParams): Promise<PaginatedResponse<InternalTransfer>> => {
    const q = new URLSearchParams()
    if (params?.page   != null) q.set('page',   String(params.page))
    if (params?.size   != null) q.set('size',   String(params.size))
    if (params?.status        ) q.set('status', params.status)
    const qs = q.toString()
    return api.get<PaginatedResponse<InternalTransfer>>(`/transfers${qs ? `?${qs}` : ''}`)
  },

  create: (data: InternalTransferCreate): Promise<TransferResponse> =>
    api.post<TransferResponse>('/transfers', data),

  /** Validate the transfer — deduct from source, add to destination, log to StockLedger */
  validate: (id: string): Promise<TransferResponse> =>
    api.post<TransferResponse>(`/transfers/${id}/validate`, {}),

  cancel: (id: string): Promise<TransferResponse> =>
    api.post<TransferResponse>(`/transfers/${id}/cancel`, {}),
}

