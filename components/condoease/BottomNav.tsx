'use client'

import { Home, FileText, CreditCard, Wrench, User } from 'lucide-react'

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
    <div
      className="flex items-center justify-around px-2 pb-safe"
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid #F1F5F9',
        paddingTop: 10,
        paddingBottom: 16,
        boxShadow: '0 -4px 20px rgba(36,54,96,0.06)',
      }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90"
            style={{ minWidth: 56 }}
          >
            {/* Icon with indicator pill */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                style={{ backgroundColor: isActive ? '#EEF2FF' : 'transparent' }}
              >
                <tab.icon
                  size={22}
                  color={isActive ? '#243660' : '#9AABC4'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: isActive ? '#243660' : '#9AABC4' }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
