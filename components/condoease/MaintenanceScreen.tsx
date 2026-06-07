'use client'

import { Plus, Wrench, ChevronRight } from 'lucide-react'
import { useMobileData, type MaintenanceStatus, type MaintenancePriority } from './mobile-data'

interface MaintenanceScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

const statusConfig: Record<MaintenanceStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#FFF3E0', text: '#FF8A1C' },
  'in-progress': { label: 'In Progress', bg: '#EFF6FF', text: '#3B82F6' },
  resolved: { label: 'Resolved', bg: '#F0FDF4', text: '#22C55E' },
  cancelled: { label: 'Cancelled', bg: '#F8FAFC', text: '#9AABC4' },
}

const priorityConfig: Record<MaintenancePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#22C55E' },
  medium: { label: 'Medium', color: '#FF8A1C' },
  high: { label: 'High', color: '#F97316' },
  urgent: { label: 'Urgent', color: '#EF4444' },
}

export function MaintenanceScreen({ onNavigate }: MaintenanceScreenProps) {
  const { maintenanceRequests, loading, error } = useMobileData()
  const active = maintenanceRequests.filter(r => r.status === 'pending' || r.status === 'in-progress')
  const history = maintenanceRequests.filter(r => r.status === 'resolved' || r.status === 'cancelled')

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Maintenance</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Submit & track repair requests</p>
          </div>
          <button
            onClick={() => onNavigate('maintenance-form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: '#FF8A1C', color: 'white' }}
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mt-4">
          {[
            { label: 'Active', count: active.length, color: '#FF8A1C' },
            { label: 'Resolved', count: history.filter(r => r.status === 'resolved').length, color: '#22C55E' },
            { label: 'Total', count: maintenanceRequests.length, color: 'rgba(255,255,255,0.7)' },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <span className="text-sm font-bold" style={{ color: chip.color }}>{chip.count}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        {(loading || error) && (
          <div className="rounded-2xl p-4" style={{ background: error ? '#FEF2F2' : '#EEF2FF', border: `1px solid ${error ? '#FECACA' : '#C7D2FE'}` }}>
            <p className="text-xs font-semibold" style={{ color: error ? '#DC2626' : '#243660' }}>{error || 'Loading maintenance requests...'}</p>
          </div>
        )}
        {/* Active requests */}
        {active.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A2847' }}>Active Requests</p>
            <div className="flex flex-col gap-3">
              {active.map(req => {
                const sc = statusConfig[req.status]
                const pc = priorityConfig[req.priority]
                return (
                  <button
                    key={req.id}
                    onClick={() => onNavigate('maintenance-detail', { requestId: req.id })}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF2FF' }}>
                        <Wrench size={18} color="#243660" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-bold pr-2" style={{ color: '#1A2847' }}>{req.title}</p>
                          <ChevronRight size={16} color="#9AABC4" className="flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>{req.category} • {req.submittedDate}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                            {sc.label}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: pc.color }}>
                            {pc.label} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A2847' }}>History</p>
            <div className="flex flex-col gap-3">
              {history.map(req => {
                const sc = statusConfig[req.status]
                return (
                  <button
                    key={req.id}
                    onClick={() => onNavigate('maintenance-detail', { requestId: req.id })}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm opacity-80"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                        <Wrench size={18} color="#9AABC4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{req.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>{req.category} • Updated {req.updatedDate}</p>
                        <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!loading && maintenanceRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <Wrench size={28} color="#243660" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#9AABC4' }}>No maintenance requests yet</p>
          </div>
        )}

        {/* FAB area */}
        <button
          onClick={() => onNavigate('maintenance-form')}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:opacity-80"
          style={{ backgroundColor: '#243660' }}
        >
          <Plus size={18} />
          Submit New Request
        </button>
      </div>
    </div>
  )
}
