'use client'

import { Megaphone, ChevronRight, AlertCircle } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { EmptyState, IconChip, InlineAlert, Screen, ScreenBody, ScreenHeader, StatusPill, type Tone } from './mobile-kit'
import { cn } from '@/lib/utils'

interface AnnouncementsScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

const categoryTones: Record<string, Tone> = {
  Utilities: 'info',
  Billing: 'warning',
  Amenities: 'success',
  Safety: 'danger',
  General: 'primary',
}

export function getCategoryTone(category: string): Tone {
  return categoryTones[category] ?? 'primary'
}

type AnnouncementSummary = { id: string; title: string; content: string; category: string; date: string }

export function AnnouncementCard({ announcement, important = false, onOpen }: { announcement: AnnouncementSummary; important?: boolean; onOpen: () => void }) {
  const tone = getCategoryTone(announcement.category)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full rounded-2xl border bg-card p-4 text-left transition-colors active:bg-muted/60',
        important ? 'border-rose-200' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <IconChip icon={Megaphone} tone={important ? 'danger' : tone} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{announcement.content}</p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill tone={tone}>{announcement.category}</StatusPill>
            <span className="text-xs text-muted-foreground">{announcement.date}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function AnnouncementsScreen({ onNavigate }: AnnouncementsScreenProps) {
  const { announcements, loading, error } = useMobileData()
  const important = announcements.filter(a => a.important)
  const regular = announcements.filter(a => !a.important)

  return (
    <Screen>
      <ScreenHeader title="Announcements" subtitle="Property news and updates" />

      <ScreenBody>
        <div className="flex items-center gap-2">
          <StatusPill tone="danger">{important.length} Important</StatusPill>
          <StatusPill tone="neutral">{announcements.length} Total</StatusPill>
        </div>

        {(loading || error) && (
          <InlineAlert tone={error ? 'danger' : 'primary'} className="text-xs font-semibold">
            {error || 'Loading announcements...'}
          </InlineAlert>
        )}

        {/* Important */}
        {important.length > 0 && (
          <section>
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-semibold text-foreground">Important Notices</h2>
            </div>
            <div className="flex flex-col gap-3">
              {important.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  important
                  onOpen={() => onNavigate('announcement-detail', { announcementId: ann.id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular */}
        {regular.length > 0 && (
          <section>
            <h2 className="mb-2.5 px-1 text-sm font-semibold text-foreground">All Announcements</h2>
            <div className="flex flex-col gap-3">
              {regular.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  onOpen={() => onNavigate('announcement-detail', { announcementId: ann.id })}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && announcements.length === 0 && <EmptyState icon={Megaphone} title="No announcements yet" />}
      </ScreenBody>
    </Screen>
  )
}
