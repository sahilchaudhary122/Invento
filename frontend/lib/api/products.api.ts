import type { Product } from '../../types/operations'
import { api } from './client'

export interface ProductListParams {
  search?: string
}

export const productsApi = {
  list: (params?: ProductListParams): Promise<Product[]> => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    const qs = q.toString()
    return api.get<Product[]>(`/products${qs ? `?${qs}` : ''}`)
  },

  get: (id: string): Promise<Product> =>
    api.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>): Promise<Product> =>
    api.post<Product>('/products', data),

  update: (id: string, data: Partial<Product>): Promise<Product> =>
    api.put<Product>(`/products/${id}`, data),

  delete: (id: string): Promise<void> =>
    api.delete<void>(`/products/${id}`),
}
