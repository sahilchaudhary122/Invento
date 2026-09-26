import { PackageSearch, WifiOff, AlertTriangle } from 'lucide-react'

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
  isUnavailable: boolean
  isError: boolean
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
    <div className="card table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Loading skeleton */}
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                {columns.map(col => (
                  <td key={col.key}>
                    <div
                      className="skeleton"
                      style={{
                        height: 14,
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
              <tr key={rowKey ? rowKey(row) : idx}>
                {columns.map(col => (
                  <td key={col.key} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Empty state */}
      {!isLoading && !isUnavailable && !isError && (data ?? []).length === 0 && (
        <div className="table-state">
          <div className="table-state-icon empty">
            <PackageSearch size={22} />
          </div>
          <h3>{emptyTitle}</h3>
          <p>{emptyMessage}</p>
        </div>
      )}

      {/* Backend unavailable */}
      {!isLoading && isUnavailable && (
        <div className="table-state">
          <div className="table-state-icon unavail">
            <WifiOff size={22} />
          </div>
          <h3>Backend not connected</h3>
          <p>
            The backend API is not reachable. Start the FastAPI server and
            refresh.
          </p>
          {apiEndpoint && (
            <span className="api-hint">
              GET {apiEndpoint}
            </span>
          )}
        </div>
      )}

      {/* API error */}
      {!isLoading && isError && (
        <div className="table-state">
          <div className="table-state-icon error">
            <AlertTriangle size={22} />
          </div>
          <h3>Failed to load data</h3>
          <p>{errorMessage ?? 'An unexpected error occurred.'}</p>
        </div>
      )}
    </div>
  )
}
