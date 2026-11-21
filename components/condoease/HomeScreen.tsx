'use client'

import { Bell, ChevronRight, FileText, Wrench, Megaphone, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import type { ApiUser } from '@/lib/api'
import { useMobileData } from './mobile-data'
import { formatPeso, EmptyState, IconButton, IconChip, InlineAlert, ListCard, ListRow, MobileCard, SectionTitle, StatusPill, type Tone } from './mobile-kit'
import { cn } from '@/lib/utils'

interface HomeScreenProps {
  user?: ApiUser | null
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

export function HomeScreen({ user, onNavigate }: HomeScreenProps) {
  const { tenant, bills, maintenanceRequests, announcements, loading, error } = useMobileData()
  const overdueBills = bills.filter(b => b.status === 'overdue')
  const unpaidBills = bills.filter(b => b.status === 'unpaid')
  const pendingMaint = maintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in-progress')
  const latestAnnouncement = announcements[0]
  // Overdue bills are payable too; without them the Pay Now button was disabled while a balance was outstanding.
  const nextPayableBill = overdueBills[0] ?? unpaidBills[0]
  // Bills are loaded oldest-first (sort=dueDate), so the most recent ones are at the end.
  const recentBills = bills.slice(-3).reverse()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,'
  const firstName = user?.firstName || tenant.name.split(' ')[0] || 'Resident'
  const hasAlerts = overdueBills.length > 0 || unpaidBills.length > 0 || pendingMaint.length > 0 || announcements.some(item => item.important)

  const quickActions: { icon: typeof FileText; label: string; screen: string; params?: Record<string, unknown>; tone: Tone }[] = [
    { icon: FileText, label: 'Bills', screen: 'bills', tone: 'primary' },
    { icon: CreditCard, label: 'Pay', screen: 'pay-bill', tone: 'accent' },
    { icon: Wrench, label: 'Repair', screen: 'maintenance', tone: 'success' },
    { icon: Megaphone, label: 'News', screen: 'notifications', params: { tab: 'announcements' }, tone: 'info' },
  ]

  return (
    <div className="mobile-scroll flex h-full flex-col bg-background">
      {/* Greeting header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-12">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{firstName}</h1>
        </div>
        <IconButton onClick={() => onNavigate('notifications')} aria-label="Notifications" className="border border-border bg-card">
          <Bell className="h-5 w-5" />
          {hasAlerts && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-card bg-accent" />}
        </IconButton>
      </header>

      <div className="space-y-5 px-4 pb-8 pt-3">
        {/* Balance card */}
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary-foreground/70">Outstanding Balance</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatPeso(tenant.balance)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-foreground/80">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {tenant.nextDueDate ? `Due ${tenant.nextDueDate}` : 'No upcoming dues'}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-primary-foreground/70">{tenant.unit || 'No unit'}</p>
              {tenant.building && <p className="mt-0.5 max-w-[8rem] truncate text-xs text-primary-foreground/50">{tenant.building}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pay-bill', { billId: nextPayableBill?.id })}
            disabled={!nextPayableBill}
            className={cn(
              'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]',
              nextPayableBill ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60',
            )}
          >
            {nextPayableBill ? 'Pay Now' : 'No Pending Bills'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {(loading || error) && (
          <InlineAlert tone={error ? 'danger' : 'primary'} className="text-xs font-semibold">
            {error || 'Loading your condo records...'}
          </InlineAlert>
        )}

        {/* Quick Actions */}
        <div>
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</p>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.screen, item.params)}
                className="flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <MobileCard className="flex h-14 w-14 items-center justify-center">
                  <IconChip icon={item.icon} tone={item.tone} />
                </MobileCard>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {overdueBills.length > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('bill-detail', { billId: overdueBills[0].id })}
            className="flex w-full items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left"
          >
            <AlertTriangle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">Overdue Payment</p>
              <p className="mt-0.5 text-xs text-rose-900/80">
                {overdueBills[0].month} bill of {formatPeso(overdueBills[0].amount)} is past due.
              </p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          </button>
        )}

        {/* Recent Bills */}
        <section>
          <SectionTitle title="Recent Bills" action="See all" onAction={() => onNavigate('bills')} />
          {!loading && recentBills.length === 0 && (
            <MobileCard>
              <EmptyState icon={FileText} title="No bills yet" className="py-8" />
            </MobileCard>
          )}
          {recentBills.length > 0 && <ListCard>
            {recentBills.map(bill => (
              <ListRow
                key={bill.id}
                icon={FileText}
                tone={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'danger' : 'warning'}
                title={bill.month}
                subtitle={`Due ${bill.dueDate}`}
                chevron={false}
                onClick={() => onNavigate('bill-detail', { billId: bill.id })}
                trailing={
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-foreground">{formatPeso(bill.amount)}</p>
                    <StatusPill status={bill.status} />
                  </div>
                }
              />
            ))}
          </ListCard>}
        </section>

        {/* Maintenance Status */}
        {pendingMaint.length > 0 && (
          <section>
            <SectionTitle title="Active Requests" action="See all" onAction={() => onNavigate('maintenance')} />
            <ListCard>
              <ListRow
                icon={Wrench}
                tone="primary"
                title={pendingMaint[0].title}
                subtitle={`Submitted ${pendingMaint[0].submittedDate}`}
                chevron={false}
                onClick={() => onNavigate('maintenance-detail', { requestId: pendingMaint[0].id })}
                trailing={<StatusPill status={pendingMaint[0].status}>{pendingMaint[0].status === 'in-progress' ? 'In Progress' : 'Pending'}</StatusPill>}
              />
            </ListCard>
          </section>
        )}

        {/* Latest Announcement */}
        {latestAnnouncement && (
          <section>
            <SectionTitle title="Latest Announcement" action="See all" onAction={() => onNavigate('announcements')} />
            <button
              type="button"
              onClick={() => onNavigate('announcement-detail', { announcementId: latestAnnouncement.id })}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-muted/60"
            >
              <div className="mb-2 flex items-center gap-2">
                {latestAnnouncement.important && <StatusPill tone="danger">Important</StatusPill>}
                <span className="text-xs text-muted-foreground">{latestAnnouncement.date}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{latestAnnouncement.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{latestAnnouncement.content}</p>
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
