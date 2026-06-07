'use client'

import { ChevronLeft, Megaphone, Calendar, Tag } from 'lucide-react'
import { useMobileData } from './mobile-data'

interface AnnouncementDetailScreenProps {
  announcementId: string
  onBack: () => void
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Utilities: { bg: '#EFF6FF', text: '#3B82F6' },
  Billing: { bg: '#FFF3E0', text: '#FF8A1C' },
  Amenities: { bg: '#F0FDF4', text: '#22C55E' },
  Safety: { bg: '#FFF1F0', text: '#EF4444' },
  General: { bg: '#EEF2FF', text: '#243660' },
}

export function AnnouncementDetailScreen({ announcementId, onBack }: AnnouncementDetailScreenProps) {
  const { announcements } = useMobileData()
  const ann = announcements.find(a => a.id === announcementId)

  if (!ann) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>Announcement not found</p>
        <button onClick={onBack} className="mt-4 px-5 py-3 rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back
        </button>
      </div>
    )
  }
  const cc = categoryColors[ann.category] ?? { bg: '#EEF2FF', text: '#243660' }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="flex items-center gap-2 mb-4">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Announcements</span>
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Megaphone size={22} color="white" />
          </div>
          <div>
            {ann.important && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                Important Notice
              </span>
            )}
            <h1 className="text-lg font-bold text-white leading-tight">{ann.title}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        {/* Meta */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={15} color="#9AABC4" />
            <span className="text-sm font-medium" style={{ color: '#5A6A8A' }}>{ann.date}</span>
          </div>
          <div className="w-px h-4" style={{ backgroundColor: '#E2E8F0' }} />
          <div className="flex items-center gap-2">
            <Tag size={15} color="#9AABC4" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: cc.bg, color: cc.text }}>
              {ann.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm leading-relaxed" style={{ color: '#1A2847', lineHeight: '1.7' }}>
            {ann.content}
          </p>
        </div>

        {/* Management info */}
        <div className="rounded-2xl p-4" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <p className="text-xs font-semibold" style={{ color: '#243660' }}>CondoEase Management</p>
          <p className="text-xs mt-0.5" style={{ color: '#5A6A8A' }}>For questions and concerns, contact your property administration office.</p>
        </div>
      </div>
    </div>
  )
}
