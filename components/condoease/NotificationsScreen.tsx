'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Bell, CreditCard, Megaphone, Wrench, type LucideIcon } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { formatPeso, EmptyState, IconChip, InlineAlert, Screen, ScreenBody, ScreenHeader, toneStyles, type Tone } from './mobile-kit'
import { AnnouncementCard } from './AnnouncementsScreen'
import { cn } from '@/lib/utils'

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

const notificationTones: Record<AppNotification['tone'], Tone> = {
  urgent: 'danger',
  warning: 'warning',
  info: 'primary',
  success: 'success',
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
      message: `${bill.month} bill of ${formatPeso(bill.amount)} is past due.`,
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
    <Screen>
      <ScreenHeader
        title="Updates"
        subtitle="Alerts and property news"
        onBack={onBack}
        actions={<IconChip icon={activeTab === 'notifications' ? Bell : Megaphone} tone="primary" />}
      />

      <ScreenBody>
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
          {[
            { key: 'notifications' as const, label: 'Notifications', count: notifications.length },
            { key: 'announcements' as const, label: 'Announcements', count: announcements.length },
          ].map(tab => {
            const selected = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'min-h-10 rounded-lg px-2 text-xs font-semibold transition-colors',
                  selected ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground',
                )}
              >
                {tab.label}
                <span className={cn('ml-1', selected ? 'text-accent' : 'text-muted-foreground/70')}>{tab.count}</span>
              </button>
            )
          })}
        </div>

        {(loading || error) && (
          <InlineAlert tone={error ? 'danger' : 'primary'} className="text-xs font-semibold">
            {error || 'Loading updates...'}
          </InlineAlert>
        )}

        {activeTab === 'notifications' && notifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {notifications.map(notification => {
              const tone = notificationTones[notification.tone]

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={notification.action}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-muted/60"
                >
                  <div className="flex items-start gap-3">
                    <IconChip icon={notification.icon} tone={tone} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                      <p className={cn('mt-2 text-xs font-semibold', toneStyles[tone].text)}>{notification.time}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : activeTab === 'notifications' ? (
          <EmptyState icon={Bell} title="No notifications" description="You are all caught up." className="py-20" />
        ) : announcements.length > 0 ? (
          <div className="flex flex-col gap-5">
            {importantAnnouncements.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center gap-2 px-1">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <h2 className="text-sm font-semibold text-foreground">Important Notices</h2>
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
              </section>
            )}

            {regularAnnouncements.length > 0 && (
              <section>
                <h2 className="mb-2.5 px-1 text-sm font-semibold text-foreground">All Announcements</h2>
                <div className="flex flex-col gap-3">
                  {regularAnnouncements.map(announcement => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onOpen={() => onNavigate('announcement-detail', { announcementId: announcement.id })}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <EmptyState icon={Megaphone} title="No announcements" description="Property updates will appear here." className="py-20" />
        )}
      </ScreenBody>
    </Screen>
  )
}
