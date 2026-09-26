type StatusVariant =
  | 'draft'
  | 'confirmed'
  | 'ready'
  | 'done'
  | 'cancelled'
  | 'validated'

const CONFIG: Record<StatusVariant, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: 'var(--status-draft)',       bg: 'var(--status-draft-bg)' },
  confirmed: { label: 'Confirmed', color: 'var(--status-confirmed)',   bg: 'var(--status-confirmed-bg)' },
  ready:     { label: 'Ready',     color: 'var(--status-ready)',       bg: 'var(--status-ready-bg)' },
  done:      { label: 'Done',      color: 'var(--status-done)',        bg: 'var(--status-done-bg)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-cancelled)',   bg: 'var(--status-cancelled-bg)' },
  validated: { label: 'Validated', color: 'var(--status-validated)',   bg: 'var(--status-validated-bg)' },
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = CONFIG[status as StatusVariant] ?? {
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
