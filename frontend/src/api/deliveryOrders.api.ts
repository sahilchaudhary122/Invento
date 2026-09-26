import type {
  DeliveryOrder,
  DeliveryOrderCreate,
  DeliveryResponse,
  PaginatedResponse,
} from '../types/operations'
import { api, ApiNotAvailableError } from './client'

export interface DeliveryOrderListParams {
  page?: number
  size?: number
  status?: string
  warehouse_id?: string | number
}

/**
 * Delivery Orders API — maps to /api/v1/deliveries
 */
export const deliveryOrdersApi = {
  list: async (params?: DeliveryOrderListParams): Promise<PaginatedResponse<DeliveryOrder>> => {
    const q = new URLSearchParams()
    if (params?.page   != null) q.set('page',         String(params.page))
    if (params?.size   != null) q.set('size',         String(params.size))
    if (params?.status        ) q.set('status',       params.status)
    if (params?.warehouse_id != null) q.set('warehouse_id', String(params.warehouse_id))
    const qs = q.toString()
    try {
      return await api.get<PaginatedResponse<DeliveryOrder>>(`/deliveries${qs ? `?${qs}` : ''}`)
    } catch (err) {
      if (err instanceof ApiNotAvailableError) {
        throw err
      }
      return { items: [], total: 0, page: params?.page ?? 1, size: params?.size ?? 50 }
    }
  },

  create: (data: DeliveryOrderCreate): Promise<DeliveryResponse> =>
    api.post<DeliveryResponse>('/deliveries', data),

  /** Dispatch / Validate — deducts from stock at source_location_id */
  validate: (id: string): Promise<DeliveryResponse> =>
    api.post<DeliveryResponse>(`/deliveries/${id}/validate`, {}),

  cancel: (id: string): Promise<DeliveryResponse> =>
    api.post<DeliveryResponse>(`/deliveries/${id}/cancel`, {}),
}

