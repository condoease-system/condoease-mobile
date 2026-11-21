'use client'

import { Check, Clock, MessageSquare, User, Wrench } from 'lucide-react'
import { useMobileData, type MaintenanceStatus } from './mobile-data'
import { EmptyState, IconChip, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, StatusPill } from './mobile-kit'
import { cn } from '@/lib/utils'

interface MaintenanceDetailScreenProps {
  requestId: string
  onBack: () => void
}

const statusConfig: Record<MaintenanceStatus, { label: string; step: number }> = {
  pending: { label: 'Pending Review', step: 1 },
  'in-progress': { label: 'In Progress', step: 2 },
  resolved: { label: 'Resolved', step: 3 },
  cancelled: { label: 'Cancelled', step: 0 },
}

const STEPS = ['Submitted', 'Reviewed', 'In Progress', 'Resolved']

export function MaintenanceDetailScreen({ requestId, onBack }: MaintenanceDetailScreenProps) {
  const { maintenanceRequests } = useMobileData()
  const req = maintenanceRequests.find(r => r.id === requestId)

  if (!req) {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          icon={Wrench}
          title="Maintenance request not found"
          action={
            <MobileButton onClick={onBack} className="w-auto px-8">
              Back
            </MobileButton>
          }
        />
      </Screen>
    )
  }
  const sc = statusConfig[req.status]
  const currentStep = sc.step

  const details = [
    { icon: Clock, label: 'Submitted', value: req.submittedDate },
    { icon: Wrench, label: 'Category', value: req.category },
    ...(req.assignedTo ? [{ icon: User, label: 'Assigned To', value: req.assignedTo }] : []),
  ]

  return (
    <Screen>
      <ScreenHeader title="Maintenance" onBack={onBack} />

      <ScreenBody>
        {/* Summary */}
        <div className="flex items-start gap-3 px-1">
          <IconChip icon={Wrench} tone="primary" className="h-12 w-12 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{req.title}</h2>
            <StatusPill status={req.status} className="mt-2">
              {sc.label}
            </StatusPill>
          </div>
        </div>

        {/* Progress tracker */}
        {req.status !== 'cancelled' && (
          <MobileCard className="p-4">
            <p className="mb-4 text-sm font-semibold text-foreground">Request Status</p>
            <div className="flex items-center">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                        idx < currentStep && 'bg-primary text-primary-foreground',
                        idx === currentStep && 'bg-accent text-accent-foreground ring-4 ring-accent/15',
                        idx > currentStep && 'border border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>
                    <p className={cn('mt-1.5 max-w-[52px] text-center text-xs font-medium', idx <= currentStep ? 'text-foreground' : 'text-muted-foreground')}>
                      {step}
                    </p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={cn('mx-1 mb-5 h-0.5 flex-1 rounded-full', idx < currentStep ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* Details */}
        <MobileCard className="p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Request Details</p>
          <div className="flex flex-col gap-3">
            {details.map(item => (
              <div key={item.label} className="flex gap-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </MobileCard>

        {/* Description */}
        <MobileCard className="p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Description</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{req.description}</p>
        </MobileCard>

        {/* Notes from team */}
        {req.notes && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Update from Management</p>
            </div>
            <p className="text-xs leading-relaxed text-blue-800">{req.notes}</p>
            <p className="mt-2 text-xs font-medium text-blue-500">Updated {req.updatedDate}</p>
          </div>
        )}
      </ScreenBody>
    </Screen>
  )
}
