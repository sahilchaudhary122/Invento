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
 * Note: Backend implements POST /adjustments, POST /adjustments/{id}/validate, POST /adjustments/{id}/cancel.
 * GET /adjustments is not implemented on backend, so list() gracefully falls back to empty items.
 */
export const adjustmentsApi = {
  list: async (): Promise<PaginatedResponse<InventoryAdjustment>> => {
    try {
      return await api.get<PaginatedResponse<InventoryAdjustment>>('/adjustments')
    } catch {
      return { items: [], total: 0, page: 1, size: 10 }
    }
  },

  get: async (id: number): Promise<InventoryAdjustment> => {
    return api.get<InventoryAdjustment>(`/adjustments/${id}`)
  },

  create: (data: InventoryAdjustmentCreate): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>('/adjustments', data),

  validate: (id: number): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>(`/adjustments/${id}/validate`, {}),

  cancel: (id: number): Promise<InventoryAdjustment> =>
    api.post<InventoryAdjustment>(`/adjustments/${id}/cancel`, {}),
}
