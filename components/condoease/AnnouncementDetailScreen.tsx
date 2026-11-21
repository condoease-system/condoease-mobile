'use client'

import { Megaphone, Calendar, Tag } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { EmptyState, IconChip, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, StatusPill } from './mobile-kit'
import { getCategoryTone } from './AnnouncementsScreen'

interface AnnouncementDetailScreenProps {
  announcementId: string
  onBack: () => void
}

export function AnnouncementDetailScreen({ announcementId, onBack }: AnnouncementDetailScreenProps) {
  const { announcements } = useMobileData()
  const ann = announcements.find(a => a.id === announcementId)

  if (!ann) {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          icon={Megaphone}
          title="Announcement not found"
          action={
            <MobileButton onClick={onBack} className="w-auto">
              Back
            </MobileButton>
          }
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="Announcements" onBack={onBack} />

      <ScreenBody className="space-y-4">
        {/* Title */}
        <div className="flex items-start gap-3 px-1 pt-1">
          <IconChip icon={Megaphone} tone={ann.important ? 'danger' : 'primary'} className="h-12 w-12 rounded-2xl" />
          <div className="min-w-0 flex-1">
            {ann.important && <StatusPill tone="danger" className="mb-2">Important Notice</StatusPill>}
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{ann.title}</h1>
          </div>
        </div>

        {/* Meta */}
        <MobileCard className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{ann.date || '-'}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <StatusPill tone={getCategoryTone(ann.category)}>{ann.category}</StatusPill>
          </div>
        </MobileCard>

        {/* Content */}
        <MobileCard className="p-5">
          <p className="whitespace-pre-line break-words text-sm leading-[1.7] text-foreground">{ann.content}</p>
        </MobileCard>

        {/* Management info */}
        <div className="rounded-2xl bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary">CondoEase Management</p>
          <p className="mt-0.5 text-xs text-muted-foreground">For questions and concerns, contact your property administration office.</p>
        </div>
      </ScreenBody>
    </Screen>
  )
}
