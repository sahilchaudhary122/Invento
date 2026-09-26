import { PackageSearch, WifiOff, AlertTriangle } from 'lucide-react'
import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[] | null
  isLoading: boolean
  isUnavailable?: boolean
  isError?: boolean
  errorMessage?: string | null
  emptyTitle?: string
  emptyMessage?: string
  apiEndpoint?: string
  rowKey?: (row: T) => string | number
}

const SKELETON_ROWS = 6

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  isUnavailable,
  isError,
  errorMessage,
  emptyTitle = 'No records found',
  emptyMessage = 'Create a new record to get started.',
  apiEndpoint,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border text-muted text-xs uppercase tracking-wider font-bold">
              {columns.map(col => (
                <th key={col.key} className={`py-3.5 px-6 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-sm">
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map(col => (
                    <td key={col.key} className="py-4 px-6">
                      <div
                        className="bg-gray-200 rounded h-4"
                        style={{
                          width: `${50 + Math.random() * 40}%`,
                          minWidth: 40,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Data rows */}
            {!isLoading &&
              !isUnavailable &&
              !isError &&
              (data ?? []).map((row, idx) => (
                <tr 
                  key={rowKey ? rowKey(row) : idx}
                  className="hover:bg-background/80 transition-colors group"
                >
                  {columns.map(col => (
                    <td key={col.key} className={`py-4 px-6 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {!isLoading && !isUnavailable && !isError && (data ?? []).length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <PackageSearch size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{emptyTitle}</h3>
          <p className="text-sm text-muted">{emptyMessage}</p>
        </div>
      )}

      {/* Backend unavailable */}
      {!isLoading && isUnavailable && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <WifiOff size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Backend not connected</h3>
          <p className="text-sm text-muted mb-4">
            The backend API is not reachable. Start the FastAPI server and
            refresh.
          </p>
          {apiEndpoint && (
            <span className="inline-block bg-background border border-border px-3 py-1 rounded-lg font-mono text-xs text-muted">
              GET {apiEndpoint}
            </span>
          )}
        </div>
      )}

      {/* API error */}
      {!isLoading && isError && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to load data</h3>
          <p className="text-sm text-muted">{errorMessage ?? 'An unexpected error occurred.'}</p>
        </div>
      )}
    </div>
  )
}
