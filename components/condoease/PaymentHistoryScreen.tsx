'use client'

import { CheckCircle, Receipt, TrendingUp } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { EmptyState, IconChip, ListCard, ListRow, MobileCard, Screen, ScreenBody, ScreenHeader } from './mobile-kit'

interface PaymentHistoryScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

export function PaymentHistoryScreen({ onNavigate }: PaymentHistoryScreenProps) {
  const { bills } = useMobileData()
  const paidBills = bills.filter(b => b.status === 'paid')
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <Screen>
      <ScreenHeader title="Payment History" subtitle="Your completed payments" />

      <ScreenBody>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MobileCard className="p-4">
            <IconChip icon={TrendingUp} tone="accent" className="h-8 w-8 rounded-lg [&_svg]:h-4 [&_svg]:w-4" />
            <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums text-foreground">₱{totalPaid.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Total Paid</p>
          </MobileCard>
          <MobileCard className="p-4">
            <IconChip icon={CheckCircle} tone="success" className="h-8 w-8 rounded-lg [&_svg]:h-4 [&_svg]:w-4" />
            <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums text-foreground">{paidBills.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Bills Settled</p>
          </MobileCard>
        </div>

        {/* List */}
        {paidBills.length === 0 && <EmptyState icon={Receipt} title="No payment history yet" />}

        {paidBills.length > 0 && (
          <ListCard>
            {paidBills.map(bill => (
              <ListRow
                key={bill.id}
                icon={CheckCircle}
                tone="success"
                title={bill.month}
                subtitle={
                  <>
                    Paid {bill.paidDate}
                    {bill.receiptNumber && <span className="block truncate font-medium text-primary">{bill.receiptNumber}</span>}
                  </>
                }
                onClick={() => onNavigate('receipt', { billId: bill.id })}
                chevron={false}
                trailing={
                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold tracking-tight tabular-nums text-foreground">₱{bill.amount.toLocaleString()}</p>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">View</p>
                  </div>
                }
              />
            ))}
          </ListCard>
        )}
      </ScreenBody>
    </Screen>
  )
}
