import React, { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  badge?: string
}

export default function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        {badge && (
          <span className="uppercase tracking-wider text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full inline-block mb-3">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
