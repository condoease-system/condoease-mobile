'use client'

import { CreditCard, Receipt } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { DetailRow, EmptyState, InlineAlert, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, StatusPill } from './mobile-kit'

interface BillDetailScreenProps {
  billId: string
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  onBack: () => void
}

export function BillDetailScreen({ billId, onNavigate, onBack }: BillDetailScreenProps) {
  const { bills } = useMobileData()
  const bill = bills.find(item => item.id === billId)

  if (!bill) {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          title="Bill not found"
          action={
            <MobileButton onClick={onBack} className="w-auto">
              Back to Bills
            </MobileButton>
          }
        />
      </Screen>
    )
  }

  const statusLabel = bill.status === 'paid' ? 'Paid' : bill.status === 'overdue' ? 'Overdue' : 'Unpaid'

  return (
    <Screen>
      <ScreenHeader title={bill.month} subtitle="Bills" onBack={onBack} />

      <ScreenBody>
        <MobileCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {bill.status === 'paid' ? `Paid on ${bill.paidDate}` : `Due ${bill.dueDate}`}
            </p>
            <StatusPill status={bill.status}>{statusLabel}</StatusPill>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </MobileCard>

        <MobileCard className="px-5 py-4">
          <p className="mb-1 text-sm font-semibold text-foreground">Bill Breakdown</p>
          <div className="divide-y divide-border">
            {bill.breakdown.map((item, index) => (
              <DetailRow key={index} label={item.label} value={<span className="tabular-nums">PHP {item.amount.toLocaleString()}</span>} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="text-base font-semibold text-foreground">Total Due</span>
            <span className="text-base font-semibold tabular-nums text-primary">
              PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </MobileCard>

        {bill.status === 'paid' && (
          <MobileCard className="px-5 py-4">
            <p className="mb-1 text-sm font-semibold text-foreground">Payment Details</p>
            <div className="divide-y divide-border">
              {[
                { label: 'Verification Reference', value: bill.referenceCode || bill.receiptNumber || '-' },
                { label: 'Payment Date', value: bill.paidDate || '-' },
                { label: 'Payment Hash', value: bill.verificationHash || '-' },
                { label: 'Amount Paid', value: `PHP ${bill.amount.toLocaleString()}` },
              ].map(row => (
                <DetailRow key={row.label} label={row.label} value={<span className="break-all">{row.value}</span>} />
              ))}
            </div>
          </MobileCard>
        )}

        {bill.status === 'overdue' && (
          <InlineAlert tone="danger">
            <p className="font-semibold">Warning: this bill is overdue</p>
            <p className="mt-1 text-xs font-normal">
              Late payment surcharge of 2% per month may apply. Please settle immediately to avoid penalties.
            </p>
          </InlineAlert>
        )}

        {bill.status !== 'paid' ? (
          <MobileButton onClick={() => onNavigate('pay-bill', { billId: bill.id })}>
            <CreditCard className="h-5 w-5" />
            Pay This Bill
          </MobileButton>
        ) : (
          <MobileButton variant="outline" onClick={() => onNavigate('receipt', { billId: bill.id })}>
            <Receipt className="h-5 w-5" />
            View Receipt
          </MobileButton>
        )}
      </ScreenBody>
    </Screen>
  )
}
