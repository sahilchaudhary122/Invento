import type { InventoryAdjustment, InventoryAdjustmentCreate, PaginatedResponse } from '../../types/operations'
import { api } from './client'

export interface AdjustmentListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: number
}

/**
 * Inventory Adjustments API — maps to /api/v1/adjustments
 */
export const adjustmentsApi = {
  list: (params?: AdjustmentListParams): Promise<PaginatedResponse<InventoryAdjustment>> => {
    const q = new URLSearchParams()
    if (params?.page != null) q.set('page', String(params.page))
    if (params?.size != null) q.set('size', String(params.size))
    if (params?.status) q.set('status', params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    return api.get<PaginatedResponse<InventoryAdjustment>>(`/adjustments${qs ? `?${qs}` : ''}`)
  },

  get: (id: number): Promise<InventoryAdjustment> =>
    api.get<InventoryAdjustment>(`/adjustments/${id}`),

  create: (data: InventoryAdjustmentCreate): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>('/adjustments', data),

  validate: (id: number): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>(`/adjustments/${id}/validate`, {}),

  cancel: (id: number): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>(`/adjustments/${id}/cancel`, {}),
}
