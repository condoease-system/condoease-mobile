'use client'

import { useState } from 'react'
import { FileText, ChevronRight } from 'lucide-react'
import { useMobileData, type BillStatus } from './mobile-data'

interface BillsScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

const FILTERS: { label: string; value: BillStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
]

export function BillsScreen({ onNavigate }: BillsScreenProps) {
  const { bills, loading, error } = useMobileData()
  const [filter, setFilter] = useState<BillStatus | 'all'>('all')

  const filtered = filter === 'all' ? bills : bills.filter(b => b.status === filter)

  const statusStyle = (status: BillStatus) => ({
    bg: status === 'paid' ? '#F0FDF4' : status === 'overdue' ? '#FFF1F0' : '#FFF3E0',
    text: status === 'paid' ? '#22C55E' : status === 'overdue' ? '#EF4444' : '#FF8A1C',
    icon: status === 'paid' ? '#22C55E' : status === 'overdue' ? '#EF4444' : '#FF8A1C',
    iconBg: status === 'paid' ? '#F0FDF4' : status === 'overdue' ? '#FFF1F0' : '#FFF3E0',
  })

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <h1 className="text-xl font-bold text-white mb-1">My Bills</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Track and manage your monthly dues</p>

        {/* Summary chips */}
        <div className="flex gap-2 mt-4">
          {[
            { label: 'Unpaid', count: bills.filter(b => b.status === 'unpaid').length, color: '#FF8A1C', bg: 'rgba(255,138,28,0.2)' },
            { label: 'Overdue', count: bills.filter(b => b.status === 'overdue').length, color: '#EF4444', bg: 'rgba(239,68,68,0.2)' },
            { label: 'Paid', count: bills.filter(b => b.status === 'paid').length, color: '#22C55E', bg: 'rgba(34,197,94,0.2)' },
          ].map(chip => (
            <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: chip.bg }}>
              <span className="text-xs font-bold" style={{ color: chip.color }}>{chip.count}</span>
              <span className="text-xs font-medium" style={{ color: chip.color }}>{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: filter === f.value ? '#243660' : '#fff',
                color: filter === f.value ? '#fff' : '#5A6A8A',
                border: filter === f.value ? 'none' : '1.5px solid #E2E8F0',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      <div className="flex-1 mobile-scroll px-5 pb-6 pt-3 flex flex-col gap-3">
        {(loading || error) && (
          <div className="rounded-2xl p-4" style={{ background: error ? '#FEF2F2' : '#EEF2FF', border: `1px solid ${error ? '#FECACA' : '#C7D2FE'}` }}>
            <p className="text-xs font-semibold" style={{ color: error ? '#DC2626' : '#243660' }}>{error || 'Loading bills...'}</p>
          </div>
        )}
        {filtered.map(bill => {
          const s = statusStyle(bill.status)
          return (
            <button
              key={bill.id}
              onClick={() => onNavigate('bill-detail', { billId: bill.id })}
              className="bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.iconBg }}>
                  <FileText size={20} color={s.icon} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-bold" style={{ color: '#1A2847' }}>{bill.month}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>
                        {bill.status === 'paid' ? `Paid on ${bill.paidDate}` : `Due ${bill.dueDate}`}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#9AABC4" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold" style={{ color: '#1A2847' }}>
                      ₱{bill.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <FileText size={28} color="#243660" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#9AABC4' }}>No {filter} bills found</p>
          </div>
        )}
      </div>
    </div>
  )
}
