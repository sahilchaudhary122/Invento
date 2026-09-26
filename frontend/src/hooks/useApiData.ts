import { useState, useEffect, useCallback } from 'react'
import { ApiNotAvailableError } from '../api/client'

export type ApiStatus = 'idle' | 'loading' | 'success' | 'unavailable' | 'error'

export interface ApiState<T> {
  data: T | null
  status: ApiStatus
  errorMessage: string | null
}

export interface UseApiDataReturn<T> extends ApiState<T> {
  refetch: () => void
  isLoading: boolean
  isUnavailable: boolean
  isError: boolean
}

/**
 * Generic hook for fetching data from the backend API.
 * Distinguishes between "API unavailable" (server down / CORS) and
 * regular API errors, so the UI can show honest, actionable messages.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiDataReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    status: 'idle',
    errorMessage: null,
  })

  const run = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', errorMessage: null }))
    try {
      const data = await fetcher()
      setState({ data, status: 'success', errorMessage: null })
    } catch (err) {
      if (err instanceof ApiNotAvailableError) {
        setState({ data: null, status: 'unavailable', errorMessage: err.message })
      } else {
        setState({
          data: null,
          status: 'error',
          errorMessage: (err as Error).message ?? 'Unknown error',
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return {
    ...state,
    refetch: run,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isUnavailable: state.status === 'unavailable',
    isError: state.status === 'error',
  }
}
