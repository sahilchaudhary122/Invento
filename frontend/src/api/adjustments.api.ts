import type {
  InventoryAdjustment,
  InventoryAdjustmentCreate,
  AdjustmentResponse,
  PaginatedResponse,
} from '../types/operations'
import { api, ApiNotAvailableError } from './client'

export interface AdjustmentListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: string | number
}

/**
 * Inventory Adjustments API — maps to /api/v1/adjustments
 */
export const adjustmentsApi = {
  list: async (params?: AdjustmentListParams): Promise<PaginatedResponse<InventoryAdjustment>> => {
    const q = new URLSearchParams()
    if (params?.page   != null) q.set('page',         String(params.page))
    if (params?.size   != null) q.set('size',         String(params.size))
    if (params?.status        ) q.set('status',       params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    try {
      return await api.get<PaginatedResponse<InventoryAdjustment>>(`/adjustments${qs ? `?${qs}` : ''}`)
    } catch (err) {
      if (err instanceof ApiNotAvailableError) {
        throw err
      }
      return { items: [], total: 0, page: params?.page ?? 1, size: params?.size ?? 50 }
    }
  },

  create: (data: InventoryAdjustmentCreate): Promise<AdjustmentResponse> =>
    api.post<AdjustmentResponse>('/adjustments', data),

  /** Validate the adjustment — sets stock to physical count and logs delta to StockLedger */
  validate: (id: string): Promise<AdjustmentResponse> =>
    api.post<AdjustmentResponse>(`/adjustments/${id}/validate`, {}),

  cancel: (id: string): Promise<AdjustmentResponse> =>
    api.post<AdjustmentResponse>(`/adjustments/${id}/cancel`, {}),
}

