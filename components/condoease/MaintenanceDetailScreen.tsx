'use client'

import { ChevronLeft, Wrench, User, MessageSquare, Clock } from 'lucide-react'
import { useMobileData, type MaintenanceStatus, type MaintenancePriority } from './mobile-data'

interface MaintenanceDetailScreenProps {
  requestId: string
  onBack: () => void
}

const statusConfig: Record<MaintenanceStatus, { label: string; bg: string; text: string; step: number }> = {
  pending: { label: 'Pending Review', bg: '#FFF3E0', text: '#FF8A1C', step: 1 },
  'in-progress': { label: 'In Progress', bg: '#EFF6FF', text: '#3B82F6', step: 2 },
  resolved: { label: 'Resolved', bg: '#F0FDF4', text: '#22C55E', step: 3 },
  cancelled: { label: 'Cancelled', bg: '#F8FAFC', text: '#9AABC4', step: 0 },
}

const priorityConfig: Record<MaintenancePriority, { label: string; color: string }> = {
  low: { label: 'Low Priority', color: '#22C55E' },
  medium: { label: 'Medium Priority', color: '#FF8A1C' },
  high: { label: 'High Priority', color: '#F97316' },
  urgent: { label: 'Urgent', color: '#EF4444' },
}

const STEPS = ['Submitted', 'Reviewed', 'In Progress', 'Resolved']

export function MaintenanceDetailScreen({ requestId, onBack }: MaintenanceDetailScreenProps) {
  const { maintenanceRequests } = useMobileData()
  const req = maintenanceRequests.find(r => r.id === requestId)

  if (!req) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>Maintenance request not found</p>
        <button onClick={onBack} className="mt-4 px-5 py-3 rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back
        </button>
      </div>
    )
  }
  const sc = statusConfig[req.status]
  const pc = priorityConfig[req.priority]
  const currentStep = sc.step

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="flex items-center gap-2 mb-4">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Maintenance</span>
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Wrench size={22} color="white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white leading-tight">{req.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                {sc.label}
              </span>
              <span className="text-xs font-bold" style={{ color: pc.color }}>{pc.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        {/* Progress tracker */}
        {req.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-bold mb-4" style={{ color: '#1A2847' }}>Request Status</p>
            <div className="flex items-center">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: idx < currentStep ? '#243660' : idx === currentStep ? '#FF8A1C' : '#F1F5F9',
                        color: idx <= currentStep ? 'white' : '#9AABC4',
                      }}
                    >
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <p className="text-xs mt-1.5 text-center font-medium" style={{ color: idx <= currentStep ? '#1A2847' : '#9AABC4', maxWidth: 52 }}>
                      {step}
                    </p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mx-1 mb-5"
                      style={{ backgroundColor: idx < currentStep ? '#243660' : '#E2E8F0' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold mb-3" style={{ color: '#1A2847' }}>Request Details</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Clock size={16} color="#9AABC4" className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium" style={{ color: '#9AABC4' }}>Submitted</p>
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{req.submittedDate}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Wrench size={16} color="#9AABC4" className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium" style={{ color: '#9AABC4' }}>Category</p>
                <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{req.category}</p>
              </div>
            </div>
            {req.assignedTo && (
              <div className="flex gap-3">
                <User size={16} color="#9AABC4" className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9AABC4' }}>Assigned To</p>
                  <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{req.assignedTo}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold mb-2" style={{ color: '#1A2847' }}>Description</p>
          <p className="text-sm leading-relaxed" style={{ color: '#5A6A8A' }}>{req.description}</p>
        </div>

        {/* Notes from team */}
        {req.notes && (
          <div className="rounded-2xl p-4" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} color="#3B82F6" />
              <p className="text-sm font-bold" style={{ color: '#1E40AF' }}>Update from Management</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#1E40AF' }}>{req.notes}</p>
            <p className="text-xs mt-2 font-medium" style={{ color: '#93C5FD' }}>Updated {req.updatedDate}</p>
          </div>
        )}
      </div>
    </div>
  )
}
