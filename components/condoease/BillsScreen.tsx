'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useMobileData, type BillStatus } from './mobile-data'
import { formatPeso, EmptyState, FilterChips, InlineAlert, ListCard, ListRow, Screen, ScreenBody, ScreenHeader, StatusPill, getStatusTone } from './mobile-kit'

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

  const summary: { label: string; status: BillStatus; count: number }[] = [
    { label: 'Unpaid', status: 'unpaid', count: bills.filter(b => b.status === 'unpaid').length },
    { label: 'Overdue', status: 'overdue', count: bills.filter(b => b.status === 'overdue').length },
    { label: 'Paid', status: 'paid', count: bills.filter(b => b.status === 'paid').length },
  ]

  return (
    <Screen>
      <ScreenHeader title="My Bills" subtitle="Track and manage your monthly dues" />

      <ScreenBody>
        {/* Summary */}
        <div className="flex gap-2">
          {summary.map(chip => (
            <StatusPill key={chip.label} status={chip.status}>
              <span className="tabular-nums">{chip.count}</span> {chip.label}
            </StatusPill>
          ))}
        </div>

        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />

        {(loading || error) && (
          <InlineAlert tone={error ? 'danger' : 'primary'} className="text-xs font-semibold">
            {error || 'Loading bills...'}
          </InlineAlert>
        )}

        {filtered.length > 0 && (
          <ListCard>
            {filtered.map(bill => (
              <ListRow
                key={bill.id}
                icon={FileText}
                tone={getStatusTone(bill.status)}
                title={bill.month}
                subtitle={bill.status === 'paid' ? (bill.paidDate ? `Paid on ${bill.paidDate}` : 'Paid') : `Due ${bill.dueDate}`}
                onClick={() => onNavigate('bill-detail', { billId: bill.id })}
                trailing={
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-base font-semibold tracking-tight tabular-nums text-foreground">
                      {formatPeso(bill.amount)}
                    </p>
                    <StatusPill status={bill.status} />
                  </div>
                }
              />
            ))}
          </ListCard>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState icon={FileText} title={filter === 'all' ? 'No bills found' : `No ${filter} bills found`} />
        )}
      </ScreenBody>
    </Screen>
  )
}
