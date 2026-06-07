'use client'

import { Megaphone, ChevronRight, AlertCircle } from 'lucide-react'
import { useMobileData } from './mobile-data'

interface AnnouncementsScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Utilities: { bg: '#EFF6FF', text: '#3B82F6' },
  Billing: { bg: '#FFF3E0', text: '#FF8A1C' },
  Amenities: { bg: '#F0FDF4', text: '#22C55E' },
  Safety: { bg: '#FFF1F0', text: '#EF4444' },
  General: { bg: '#EEF2FF', text: '#243660' },
}

export function AnnouncementsScreen({ onNavigate }: AnnouncementsScreenProps) {
  const { announcements, loading, error } = useMobileData()
  const important = announcements.filter(a => a.important)
  const regular = announcements.filter(a => !a.important)

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <h1 className="text-xl font-bold text-white mb-1">Announcements</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Property news and updates</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
            {important.length} Important
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            {announcements.length} Total
          </span>
        </div>
      </div>

      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        {(loading || error) && (
          <div className="rounded-2xl p-4" style={{ background: error ? '#FEF2F2' : '#EEF2FF', border: `1px solid ${error ? '#FECACA' : '#C7D2FE'}` }}>
            <p className="text-xs font-semibold" style={{ color: error ? '#DC2626' : '#243660' }}>{error || 'Loading announcements...'}</p>
          </div>
        )}
        {/* Important */}
        {important.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} color="#EF4444" />
              <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Important Notices</p>
            </div>
            <div className="flex flex-col gap-3">
              {important.map(ann => {
                const cc = categoryColors[ann.category] ?? { bg: '#EEF2FF', text: '#243660' }
                return (
                  <button
                    key={ann.id}
                    onClick={() => onNavigate('announcement-detail', { announcementId: ann.id })}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                    style={{ border: '1.5px solid #FECACA' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF1F0' }}>
                        <Megaphone size={18} color="#EF4444" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{ann.title}</p>
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#5A6A8A' }}>{ann.content}</p>
                          </div>
                          <ChevronRight size={16} color="#9AABC4" className="flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cc.bg, color: cc.text }}>
                            {ann.category}
                          </span>
                          <span className="text-xs" style={{ color: '#9AABC4' }}>{ann.date}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Regular */}
        {regular.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A2847' }}>All Announcements</p>
            <div className="flex flex-col gap-3">
              {regular.map(ann => {
                const cc = categoryColors[ann.category] ?? { bg: '#EEF2FF', text: '#243660' }
                return (
                  <button
                    key={ann.id}
                    onClick={() => onNavigate('announcement-detail', { announcementId: ann.id })}
                    className="bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cc.bg }}>
                        <Megaphone size={18} color={cc.text} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <p className="text-sm font-semibold" style={{ color: '#1A2847' }}>{ann.title}</p>
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#5A6A8A' }}>{ann.content}</p>
                          </div>
                          <ChevronRight size={16} color="#9AABC4" className="flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cc.bg, color: cc.text }}>
                            {ann.category}
                          </span>
                          <span className="text-xs" style={{ color: '#9AABC4' }}>{ann.date}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {!loading && announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <Megaphone size={28} color="#243660" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#9AABC4' }}>No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
