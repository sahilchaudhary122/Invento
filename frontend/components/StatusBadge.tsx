import React from 'react'

type StatusVariant =
  | 'draft'
  | 'confirmed'
  | 'ready'
  | 'done'
  | 'cancelled'
  | 'validated'
  | 'waiting'

const CONFIG: Record<StatusVariant, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-slate-100 text-slate-700 border-slate-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ready:     { label: 'Ready',     className: 'bg-amber-100 text-amber-700 border-amber-200' },
  done:      { label: 'Done',      className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700 border-rose-200' },
  validated: { label: 'Validated', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  waiting:   { label: 'Waiting',   className: 'bg-amber-50 text-amber-600 border-amber-200' },
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = status.toLowerCase() as StatusVariant
  const cfg = CONFIG[s] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.className.split(' ')[1].replace('text-', 'bg-')}`} />
      {cfg.label}
    </span>
  )
}
