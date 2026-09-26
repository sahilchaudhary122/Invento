import { api } from './client'
import { Category } from '../../types/operations'

export const categoriesApi = {
  list: (): Promise<Category[]> =>
    api.get<Category[]>('/categories'),

  get: (id: string): Promise<Category> =>
    api.get<Category>(`/categories/${id}`),

  create: (data: Partial<Category>): Promise<Category> =>
    api.post<Category>('/categories', data),
}
