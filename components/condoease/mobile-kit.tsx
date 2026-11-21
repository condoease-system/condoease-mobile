'use client'

import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Shared building blocks so every tenant screen uses the same clean light look. */

export type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export const toneStyles: Record<Tone, { soft: string; text: string; dot: string }> = {
  neutral: { soft: 'bg-muted text-muted-foreground', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  primary: { soft: 'bg-primary/10 text-primary', text: 'text-primary', dot: 'bg-primary' },
  accent: { soft: 'bg-accent/15 text-accent', text: 'text-accent', dot: 'bg-accent' },
  success: { soft: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  warning: { soft: 'bg-amber-50 text-amber-700', text: 'text-amber-600', dot: 'bg-amber-500' },
  danger: { soft: 'bg-rose-50 text-rose-700', text: 'text-rose-600', dot: 'bg-rose-500' },
  info: { soft: 'bg-blue-50 text-blue-700', text: 'text-blue-600', dot: 'bg-blue-500' },
}

const statusTones: Record<string, Tone> = {
  paid: 'success',
  resolved: 'success',
  completed: 'success',
  active: 'success',
  unpaid: 'warning',
  pending: 'warning',
  'in-progress': 'info',
  ongoing: 'info',
  overdue: 'danger',
  urgent: 'danger',
  high: 'danger',
  emergency: 'danger',
  cancelled: 'neutral',
}

export function getStatusTone(status: string): Tone {
  return statusTones[status.trim().toLowerCase()] ?? 'neutral'
}

export function formatStatus(status: string) {
  return status.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export function StatusPill({ status, tone, children, className }: { status?: string; tone?: Tone; children?: ReactNode; className?: string }) {
  const resolvedTone = tone ?? getStatusTone(status ?? '')
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', toneStyles[resolvedTone].soft, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', toneStyles[resolvedTone].dot)} />
      {children ?? formatStatus(status ?? '')}
    </span>
  )
}

/* Screen layout */

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex h-full flex-col bg-background', className)}>{children}</div>
}

export function ScreenBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mobile-scroll flex-1 space-y-5 px-4 pb-8 pt-4', className)}>{children}</div>
}

export function ScreenHeader({ title, subtitle, onBack, actions, className }: { title: ReactNode; subtitle?: ReactNode; onBack?: () => void; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn('sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 pb-3 pt-12 backdrop-blur-md', className)}>
      {onBack && (
        <IconButton onClick={onBack} aria-label="Go back" className="-ml-1.5">
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  )
}

export function IconButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn('relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95', className)}
      {...props}
    />
  )
}

/* Content */

export function SectionTitle({ title, action, onAction }: { title: ReactNode; action?: ReactNode; onAction?: () => void }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {action && (
        <button type="button" onClick={onAction} className="text-xs font-semibold text-primary">
          {action}
        </button>
      )}
    </div>
  )
}

export function MobileCard({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)} {...props}>
      {children}
    </div>
  )
}

export function IconChip({ icon: Icon, tone = 'primary', className }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneStyles[tone].soft, className)}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

export function ListRow({
  icon,
  tone,
  title,
  subtitle,
  trailing,
  onClick,
  chevron = Boolean(onClick),
  className,
}: {
  icon?: LucideIcon
  tone?: Tone
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  chevron?: boolean
  className?: string
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left', onClick && 'transition-colors active:bg-muted/60', className)}
    >
      {icon && <IconChip icon={icon} tone={tone} />}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {trailing}
      {chevron && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
    </Comp>
  )
}

/* A card whose rows are separated by hairlines. */
export function ListCard({ children, className }: { children: ReactNode; className?: string }) {
  return <MobileCard className={cn('divide-y divide-border overflow-hidden', className)}>{children}</MobileCard>
}

export function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

export function FilterChips<T extends string>({ options, value, onChange }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="mobile-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
            value === option.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: { icon?: LucideIcon; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function InlineAlert({ children, tone = 'danger', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <div className={cn('rounded-xl px-4 py-3 text-sm font-medium', toneStyles[tone].soft, className)}>{children}</div>
}

/* Buttons sized for thumbs */

const buttonVariants = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-primary hover:bg-primary/5',
  danger: 'bg-destructive text-white hover:bg-destructive/90',
}

export function MobileButton({ variant = 'primary', className, ...props }: ComponentProps<'button'> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

/* Sticky action area pinned to the bottom of a screen */
export function BottomActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('shrink-0 space-y-2 border-t border-border bg-background/90 px-4 pb-6 pt-3 backdrop-blur-md', className)}>{children}</div>
}
