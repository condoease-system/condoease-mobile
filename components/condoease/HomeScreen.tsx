'use client'

import { Bell, ChevronRight, FileText, Wrench, Megaphone, Clock, AlertTriangle } from 'lucide-react'
import type { ApiUser } from '@/lib/api'
import { useMobileData } from './mobile-data'

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
  const firstName = user?.firstName || tenant.name.split(' ')[0] || 'Resident'

  return (
    <div className="flex flex-col h-full mobile-scroll" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8 relative"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Good morning,</p>
            <h1 className="text-xl font-bold text-white">{firstName}</h1>
          </div>
          <button
            onClick={() => onNavigate('notifications')}
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Bell size={20} color="white" />
            {(overdueBills.length > 0 || unpaidBills.length > 0 || pendingMaint.length > 0 || announcements.some(item => item.important)) && (
              <span
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: '#FF8A1C', borderColor: '#243660' }}
              />
            )}
          </button>
        </div>

        {/* Balance Card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Outstanding Balance</p>
              <p className="text-3xl font-bold text-white">
                ₱{tenant.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={13} color="#FF8A1C" />
                <p className="text-xs font-medium" style={{ color: '#FF8A1C' }}>
                  Due {tenant.nextDueDate}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{tenant.unit}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Tower 2</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pay-bill', { billId: unpaidBills[0]?.id })}
            disabled={!unpaidBills[0]}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ backgroundColor: unpaidBills[0] ? '#FF8A1C' : '#C7D2FE', color: 'white' }}
          >
            {unpaidBills[0] ? 'Pay Now' : 'No Pending Bills'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {(loading || error) && (
        <div className="mx-5 mt-4 rounded-2xl p-4" style={{ background: error ? '#FEF2F2' : '#EEF2FF', border: `1px solid ${error ? '#FECACA' : '#C7D2FE'}` }}>
          <p className="text-xs font-semibold" style={{ color: error ? '#DC2626' : '#243660' }}>
            {error || 'Loading your condo records...'}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9AABC4' }}>Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'Bills', screen: 'bills', color: '#EEF2FF', iconColor: '#243660' },
            { icon: FileText, label: 'Pay', screen: 'pay-bill', color: '#FFF3E0', iconColor: '#FF8A1C' },
            { icon: Wrench, label: 'Repair', screen: 'maintenance', color: '#F0FDF4', iconColor: '#22C55E' },
            { icon: Megaphone, label: 'News', screen: 'notifications', params: { tab: 'announcements' }, color: '#FFF8F0', iconColor: '#F97316' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen, item.params)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: item.color }}>
                <item.icon size={22} color={item.iconColor} />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#1A2847' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(overdueBills.length > 0) && (
        <div className="mx-5 mb-4">
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: '#FFF1F0', border: '1px solid #FECACA' }}
          >
            <AlertTriangle size={18} color="#EF4444" className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#EF4444' }}>Overdue Payment</p>
              <p className="text-xs mt-0.5" style={{ color: '#7F1D1D' }}>
                {overdueBills[0].month} bill of ₱{overdueBills[0].amount.toLocaleString()} is past due.
              </p>
            </div>
            <button onClick={() => onNavigate('bill-detail', { billId: overdueBills[0].id })} className="flex-shrink-0">
              <ChevronRight size={16} color="#EF4444" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Bills */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Recent Bills</p>
          <button onClick={() => onNavigate('bills')} className="text-xs font-semibold" style={{ color: '#FF8A1C' }}>
            See all
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {bills.slice(0, 3).map((bill) => (
            <button
              key={bill.id}
              onClick={() => onNavigate('bill-detail', { billId: bill.id })}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm text-left active:scale-[0.98] transition-transform"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    bill.status === 'paid' ? '#F0FDF4' :
                    bill.status === 'overdue' ? '#FFF1F0' : '#FFF3E0',
                }}
              >
                <FileText
                  size={18}
                  color={
                    bill.status === 'paid' ? '#22C55E' :
                    bill.status === 'overdue' ? '#EF4444' : '#FF8A1C'
                  }
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{bill.month}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>Due {bill.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: '#1A2847' }}>
                  ₱{bill.amount.toLocaleString()}
                </p>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      bill.status === 'paid' ? '#F0FDF4' :
                      bill.status === 'overdue' ? '#FFF1F0' : '#FFF3E0',
                    color:
                      bill.status === 'paid' ? '#22C55E' :
                      bill.status === 'overdue' ? '#EF4444' : '#FF8A1C',
                  }}
                >
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Status */}
      {pendingMaint.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Active Requests</p>
            <button onClick={() => onNavigate('maintenance')} className="text-xs font-semibold" style={{ color: '#FF8A1C' }}>
              See all
            </button>
          </div>
          <button
            onClick={() => onNavigate('maintenance-detail', { requestId: pendingMaint[0].id })}
            className="w-full bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF2FF' }}>
              <Wrench size={18} color="#243660" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{pendingMaint[0].title}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>Submitted {pendingMaint[0].submittedDate}</p>
            </div>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: pendingMaint[0].status === 'in-progress' ? '#EFF6FF' : '#FFF3E0',
                color: pendingMaint[0].status === 'in-progress' ? '#3B82F6' : '#FF8A1C',
              }}
            >
              {pendingMaint[0].status === 'in-progress' ? 'In Progress' : 'Pending'}
            </span>
          </button>
        </div>
      )}

      {/* Latest Announcement */}
      {latestAnnouncement && (
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Latest Announcement</p>
          <button onClick={() => onNavigate('announcements')} className="text-xs font-semibold" style={{ color: '#FF8A1C' }}>
            See all
          </button>
        </div>
        <button
          onClick={() => onNavigate('announcement-detail', { announcementId: latestAnnouncement.id })}
          className="w-full bg-white rounded-2xl p-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            {latestAnnouncement.important && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFF1F0', color: '#EF4444' }}>
                Important
              </span>
            )}
            <span className="text-xs font-medium" style={{ color: '#9AABC4' }}>{latestAnnouncement.date}</span>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{latestAnnouncement.title}</p>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: '#5A6A8A' }}>{latestAnnouncement.content}</p>
        </button>
      </div>
      )}
    </div>
  )
}
