import { type ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
}

export function Badge({ variant = 'neutral', children, dot = false }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error:   'bg-red-50 text-red-700 border-red-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-surface-100 text-navy-600 border-surface-200',
  }

  const dotStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
    neutral: 'bg-navy-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border ${styles[variant]}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[variant]}`} />
      )}
      {children}
    </span>
  )
}
