import { api } from './client'
import { DashboardStats } from '../../types/operations'

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> =>
    api.get<DashboardStats>('/dashboard'),
}
