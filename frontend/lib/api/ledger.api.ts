import { api } from './client'
import { LedgerEntry } from '../../types/operations'

export interface LedgerParams {
  product_id?: string
  operation_type?: string
}

export const ledgerApi = {
  list: (params?: LedgerParams): Promise<LedgerEntry[]> => {
    const q = new URLSearchParams()
    if (params?.product_id) q.set('product_id', params.product_id)
    if (params?.operation_type) q.set('operation_type', params.operation_type)
    const qs = q.toString()
    return api.get<LedgerEntry[]>(`/ledger${qs ? `?${qs}` : ''}`)
  },
}
