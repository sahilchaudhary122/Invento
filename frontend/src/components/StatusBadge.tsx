type StatusVariant =
  | 'draft'
  | 'confirmed'
  | 'ready'
  | 'done'
  | 'cancelled'
  | 'canceled'
  | 'validated'
  | 'DRAFT'
  | 'VALIDATED'
  | 'CANCELED'

const CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: 'var(--status-draft)',       bg: 'var(--status-draft-bg)' },
  confirmed: { label: 'Confirmed', color: 'var(--status-confirmed)',   bg: 'var(--status-confirmed-bg)' },
  ready:     { label: 'Ready',     color: 'var(--status-ready)',       bg: 'var(--status-ready-bg)' },
  done:      { label: 'Done',      color: 'var(--status-done)',        bg: 'var(--status-done-bg)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-cancelled)',   bg: 'var(--status-cancelled-bg)' },
  canceled:  { label: 'Canceled',  color: 'var(--status-cancelled)',   bg: 'var(--status-cancelled-bg)' },
  validated: { label: 'Validated', color: 'var(--status-validated)',   bg: 'var(--status-validated-bg)' },
  DRAFT:     { label: 'Draft',     color: 'var(--status-draft)',       bg: 'var(--status-draft-bg)' },
  VALIDATED: { label: 'Validated', color: 'var(--status-validated)',   bg: 'var(--status-validated-bg)' },
  CANCELED:  { label: 'Canceled',  color: 'var(--status-cancelled)',   bg: 'var(--status-cancelled-bg)' },
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const raw = status ?? ''
  const key = raw.trim()
  const normalized = key.toLowerCase()

  const cfg =
    CONFIG[key] ??
    CONFIG[normalized] ??
    (normalized === 'canceled' ? CONFIG['cancelled'] : undefined) ?? {
      label: status,
      color: 'var(--text-muted)',
      bg: 'var(--bg-hover)',
    }

  return (
    <span
      className="status-badge"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span
        className="status-dot"
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  )
}
