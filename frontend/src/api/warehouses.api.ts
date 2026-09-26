import { api } from './client'
import type { Warehouse, Location } from '../types/operations'

/**
 * Warehouses & Locations API — maps to /api/v1/warehouses and /api/v1/locations
 */
export const warehousesApi = {
  /** Fetch all warehouses */
  getWarehouses: (): Promise<Warehouse[]> =>
    api.get<Warehouse[]>('/warehouses/'),

  /** Fetch a single warehouse by ID */
  getWarehouse: (id: string): Promise<Warehouse> =>
    api.get<Warehouse>(`/warehouses/${id}`),

  /** Fetch locations (either all or filtered by warehouseId) */
  getLocations: (warehouseId?: string): Promise<Location[]> =>
    warehouseId
      ? api.get<Location[]>(`/warehouses/${warehouseId}/locations`)
      : api.get<Location[]>('/locations/'),
}
