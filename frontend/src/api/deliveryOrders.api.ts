import type { DeliveryOrder, DeliveryOrderCreate, PaginatedResponse } from '../types/operations'
import { api } from './client'

export interface DeliveryOrderListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: number
}

/**
 * Delivery Orders API — maps to /api/v1/delivery-orders
 */
export const deliveryOrdersApi = {
  list: (params?: DeliveryOrderListParams): Promise<PaginatedResponse<DeliveryOrder>> => {
    const q = new URLSearchParams()
    if (params?.page   != null) q.set('page',         String(params.page))
    if (params?.size   != null) q.set('size',         String(params.size))
    if (params?.status        ) q.set('status',       params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    return api.get<PaginatedResponse<DeliveryOrder>>(`/delivery-orders${qs ? `?${qs}` : ''}`)
  },

  get: (id: number): Promise<DeliveryOrder> =>
    api.get<DeliveryOrder>(`/delivery-orders/${id}`),

  create: (data: DeliveryOrderCreate): Promise<DeliveryOrder> =>
    api.post<DeliveryOrder>('/delivery-orders', data),

  /** Mark as ready to ship */
  confirm: (id: number): Promise<DeliveryOrder> =>
    api.post<DeliveryOrder>(`/delivery-orders/${id}/confirm`, {}),

  /** Dispatch — marks as done */
  dispatch: (id: number): Promise<DeliveryOrder> =>
    api.post<DeliveryOrder>(`/delivery-orders/${id}/dispatch`, {}),

  cancel: (id: number): Promise<DeliveryOrder> =>
    api.post<DeliveryOrder>(`/delivery-orders/${id}/cancel`, {}),
}
