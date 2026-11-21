'use client'

import { Plus, Wrench } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { EmptyState, InlineAlert, ListCard, ListRow, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, SectionTitle, StatusPill, toneStyles, type Tone } from './mobile-kit'
import { cn } from '@/lib/utils'

interface MaintenanceScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

export function MaintenanceScreen({ onNavigate }: MaintenanceScreenProps) {
  const { maintenanceRequests, loading, error } = useMobileData()
  const active = maintenanceRequests.filter(r => r.status === 'pending' || r.status === 'in-progress')
  const history = maintenanceRequests.filter(r => r.status === 'resolved' || r.status === 'cancelled')

  const stats: { label: string; count: number; tone: Tone }[] = [
    { label: 'Active', count: active.length, tone: 'warning' },
    { label: 'Resolved', count: history.filter(r => r.status === 'resolved').length, tone: 'success' },
    { label: 'Total', count: maintenanceRequests.length, tone: 'neutral' },
  ]

  return (
    <Screen>
      <ScreenHeader
        title="Maintenance"
        subtitle="Submit & track repair requests"
        actions={
          <button
            type="button"
            onClick={() => onNavigate('maintenance-form')}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        }
      />

      <ScreenBody>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map(stat => (
            <MobileCard key={stat.label} className="px-3 py-3">
              <p className="text-xl font-semibold tracking-tight text-foreground">{stat.count}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn('h-1.5 w-1.5 rounded-full', toneStyles[stat.tone].dot)} />
                {stat.label}
              </p>
            </MobileCard>
          ))}
        </div>

        {(loading || error) && (
          <InlineAlert tone={error ? 'danger' : 'primary'} className="text-xs font-semibold">
            {error || 'Loading maintenance requests...'}
          </InlineAlert>
        )}

        {/* Active requests */}
        {active.length > 0 && (
          <section>
            <SectionTitle title="Active Requests" />
            <ListCard>
              {active.map(req => (
                <ListRow
                  key={req.id}
                  icon={Wrench}
                  tone="primary"
                  title={req.title}
                  subtitle={`${req.category} • ${req.submittedDate}`}
                  trailing={<StatusPill status={req.status} />}
                  onClick={() => onNavigate('maintenance-detail', { requestId: req.id })}
                />
              ))}
            </ListCard>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section>
            <SectionTitle title="History" />
            <ListCard>
              {history.map(req => (
                <ListRow
                  key={req.id}
                  icon={Wrench}
                  tone="neutral"
                  title={req.title}
                  subtitle={`${req.category} • Updated ${req.updatedDate}`}
                  trailing={<StatusPill status={req.status} />}
                  onClick={() => onNavigate('maintenance-detail', { requestId: req.id })}
                />
              ))}
            </ListCard>
          </section>
        )}

        {!loading && maintenanceRequests.length === 0 && (
          <EmptyState icon={Wrench} title="No maintenance requests yet" className="py-8" />
        )}

        <MobileButton onClick={() => onNavigate('maintenance-form')}>
          <Plus className="h-4 w-4" />
          Submit New Request
        </MobileButton>
      </ScreenBody>
    </Screen>
  )
}
