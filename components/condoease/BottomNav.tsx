'use client'

import { Home, FileText, CreditCard, Wrench, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  active: string
  onNavigate: (screen: string) => void
}

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'bills', icon: FileText, label: 'Bills' },
  { id: 'pay-bill', icon: CreditCard, label: 'Pay' },
  { id: 'maintenance', icon: Wrench, label: 'Repairs' },
  { id: 'profile', icon: User, label: 'Profile' },
]

// Map detail screens to their parent tab
const screenToTab: Record<string, string> = {
  home: 'home',
  bills: 'bills',
  'bill-detail': 'bills',
  'pay-bill': 'pay-bill',
  'payment-success': 'pay-bill',
  'payment-history': 'bills',
  receipt: 'bills',
  maintenance: 'maintenance',
  'maintenance-form': 'maintenance',
  'maintenance-detail': 'maintenance',
  announcements: 'home',
  'announcement-detail': 'home',
  profile: 'profile',
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const activeTab = screenToTab[active] ?? active

  return (
    <nav className="pb-safe flex shrink-0 items-center justify-around border-t border-border bg-background/90 px-2 pb-4 pt-2 backdrop-blur-md">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-all active:scale-95',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-8 w-14 items-center justify-center rounded-full transition-colors',
                isActive ? 'bg-primary/10' : 'bg-transparent',
              )}
            >
              <tab.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.25 : 1.8} />
            </span>
            <span className={cn('text-[11px]', isActive ? 'font-semibold' : 'font-medium')}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
