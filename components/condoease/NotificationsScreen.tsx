'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Bell, ChevronLeft, ChevronRight, CreditCard, Megaphone, Wrench, type LucideIcon } from 'lucide-react'
import { useMobileData } from './mobile-data'

interface NotificationsScreenProps {
  initialTab?: 'notifications' | 'announcements'
  onBack: () => void
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

type AppNotification = {
  id: string
  title: string
  message: string
  time: string
  tone: 'urgent' | 'warning' | 'info' | 'success'
  icon: LucideIcon
  action?: () => void
}

const toneStyles = {
  urgent: { bg: '#FFF1F0', border: '#FECACA', iconBg: '#FEE2E2', color: '#EF4444' },
  warning: { bg: '#FFF8F0', border: '#FED7AA', iconBg: '#FFF3E0', color: '#FF8A1C' },
  info: { bg: '#EEF2FF', border: '#C7D2FE', iconBg: '#E0E7FF', color: '#243660' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', iconBg: '#DCFCE7', color: '#22C55E' },
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Utilities: { bg: '#EFF6FF', text: '#3B82F6' },
  Billing: { bg: '#FFF3E0', text: '#FF8A1C' },
  Amenities: { bg: '#F0FDF4', text: '#22C55E' },
  Safety: { bg: '#FFF1F0', text: '#EF4444' },
  General: { bg: '#EEF2FF', text: '#243660' },
}

export function NotificationsScreen({ initialTab = 'notifications', onBack, onNavigate }: NotificationsScreenProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>(initialTab)
  const { bills, maintenanceRequests, announcements, loading, error } = useMobileData()
  const overdueBills = bills.filter(bill => bill.status === 'overdue')
  const unpaidBills = bills.filter(bill => bill.status === 'unpaid')
  const activeRequests = maintenanceRequests.filter(request => request.status === 'pending' || request.status === 'in-progress')
  const importantAnnouncements = announcements.filter(announcement => announcement.important)
  const regularAnnouncements = announcements.filter(announcement => !announcement.important)

  const notifications: AppNotification[] = [
    ...overdueBills.slice(0, 3).map(bill => ({
      id: `overdue-${bill.id}`,
      title: 'Overdue bill',
      message: `${bill.month} bill of PHP ${bill.amount.toLocaleString()} is past due.`,
      time: `Due ${bill.dueDate}`,
      tone: 'urgent' as const,
      icon: AlertTriangle,
      action: () => onNavigate('bill-detail', { billId: bill.id }),
    })),
    ...unpaidBills.slice(0, 3).map(bill => ({
      id: `unpaid-${bill.id}`,
      title: 'Bill ready for payment',
      message: `${bill.month} bill is ready. Pay securely through Xendit.`,
      time: `Due ${bill.dueDate}`,
      tone: 'warning' as const,
      icon: CreditCard,
      action: () => onNavigate('pay-bill', { billId: bill.id }),
    })),
    ...activeRequests.slice(0, 3).map(request => ({
      id: `maintenance-${request.id}`,
      title: request.status === 'in-progress' ? 'Maintenance in progress' : 'Maintenance pending',
      message: request.title,
      time: request.updatedDate || request.submittedDate,
      tone: 'info' as const,
      icon: Wrench,
      action: () => onNavigate('maintenance-detail', { requestId: request.id }),
    })),
    ...importantAnnouncements.slice(0, 3).map(announcement => ({
      id: `announcement-${announcement.id}`,
      title: 'Important announcement',
      message: announcement.title,
      time: announcement.date,
      tone: 'info' as const,
      icon: Megaphone,
      action: () => onNavigate('announcement-detail', { announcementId: announcement.id }),
    })),
  ]

  return (
    <div className="flex h-full flex-col" style={{ background: '#F4F6FA' }}>
      <div
        className="px-5 pb-6 pt-12"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="mb-4 flex items-center gap-2">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Updates</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Alerts and property news</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {activeTab === 'notifications' ? <Bell size={21} color="white" /> : <Megaphone size={21} color="white" />}
          </div>
        </div>
      </div>

      <div className="mobile-scroll flex-1 px-5 py-5">
        <div className="mb-5 grid grid-cols-2 rounded-2xl p-1 shadow-sm" style={{ backgroundColor: '#E9EEF7' }}>
          {[
            { key: 'notifications' as const, label: 'Notifications', count: notifications.length },
            { key: 'announcements' as const, label: 'Announcements', count: announcements.length },
          ].map(tab => {
            const selected = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="min-h-11 rounded-xl px-2 text-xs font-bold transition-colors"
                style={{
                  backgroundColor: selected ? '#FFFFFF' : 'transparent',
                  color: selected ? '#1A2847' : '#5A6A8A',
                  boxShadow: selected ? '0 6px 16px rgba(26,40,71,0.08)' : 'none',
                }}
              >
                {tab.label}
                <span className="ml-1" style={{ color: selected ? '#FF8A1C' : '#9AABC4' }}>{tab.count}</span>
              </button>
            )
          })}
        </div>

        {(loading || error) && (
          <div className="mb-4 rounded-2xl p-4" style={{ background: error ? '#FEF2F2' : '#EEF2FF', border: `1px solid ${error ? '#FECACA' : '#C7D2FE'}` }}>
            <p className="text-xs font-semibold" style={{ color: error ? '#DC2626' : '#243660' }}>{error || 'Loading updates...'}</p>
          </div>
        )}

        {activeTab === 'notifications' && notifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {notifications.map(notification => {
              const Icon = notification.icon
              const style = toneStyles[notification.tone]

              return (
                <button
                  key={notification.id}
                  onClick={notification.action}
                  className="rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: style.iconBg }}>
                      <Icon size={18} color={style.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{notification.title}</p>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: '#5A6A8A' }}>{notification.message}</p>
                      <p className="mt-2 text-xs font-semibold" style={{ color: style.color }}>{notification.time}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : activeTab === 'notifications' ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: '#EEF2FF' }}>
              <Bell size={28} color="#243660" />
            </div>
            <p className="mt-4 text-sm font-bold" style={{ color: '#1A2847' }}>No notifications</p>
            <p className="mt-1 text-xs" style={{ color: '#9AABC4' }}>You are all caught up.</p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="flex flex-col gap-5">
            {importantAnnouncements.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle size={16} color="#EF4444" />
                  <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Important Notices</p>
                </div>
                <div className="flex flex-col gap-3">
                  {importantAnnouncements.map(announcement => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      important
                      onOpen={() => onNavigate('announcement-detail', { announcementId: announcement.id })}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularAnnouncements.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-bold" style={{ color: '#1A2847' }}>All Announcements</p>
                <div className="flex flex-col gap-3">
                  {regularAnnouncements.map(announcement => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onOpen={() => onNavigate('announcement-detail', { announcementId: announcement.id })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: '#EEF2FF' }}>
              <Megaphone size={28} color="#243660" />
            </div>
            <p className="mt-4 text-sm font-bold" style={{ color: '#1A2847' }}>No announcements</p>
            <p className="mt-1 text-xs" style={{ color: '#9AABC4' }}>Property updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AnnouncementCard({
  announcement,
  important = false,
  onOpen,
}: {
  announcement: { id: string; title: string; content: string; category: string; date: string }
  important?: boolean
  onOpen: () => void
}) {
  const cc = categoryColors[announcement.category] ?? { bg: '#EEF2FF', text: '#243660' }
  const iconBg = important ? '#FFF1F0' : cc.bg
  const iconColor = important ? '#EF4444' : cc.text

  return (
    <button
      onClick={onOpen}
      className="rounded-2xl bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
      style={{ border: important ? '1.5px solid #FECACA' : '1px solid #EEF2F7' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <Megaphone size={18} color={iconColor} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{announcement.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: '#5A6A8A' }}>{announcement.content}</p>
            </div>
            <ChevronRight size={16} color="#9AABC4" className="mt-0.5 flex-shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: cc.bg, color: cc.text }}>
              {announcement.category}
            </span>
            <span className="text-xs" style={{ color: '#9AABC4' }}>{announcement.date}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
