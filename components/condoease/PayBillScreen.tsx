'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Check, CreditCard, Shield, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiRequest } from '@/lib/api'
import { useMobileData } from './mobile-data'
import { formatPeso, DetailRow, EmptyState, IconChip, InlineAlert, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader, SectionTitle, type Tone } from './mobile-kit'

interface PayBillScreenProps {
  billId?: string
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  onBack: () => void
}

const METHODS: { id: string; name: string; desc: string; icon: typeof CreditCard; tone: Tone }[] = [
  { id: 'xendit', name: 'Xendit', desc: 'Pay securely via Xendit Checkout', icon: CreditCard, tone: 'info' },
]

function getPaymentReturnUrlBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (configuredUrl) return configuredUrl

  const origin = window.location.origin
  if (origin.startsWith('https://') || origin.startsWith('http://localhost')) return origin

  return 'https://condoease.vercel.app'
}

export function PayBillScreen({ billId, onBack }: PayBillScreenProps) {
  const { bills, loading, error: loadError } = useMobileData()
  const payableBills = useMemo(() => bills.filter(bill => bill.status !== 'paid'), [bills])
  const [selectedBillId, setSelectedBillId] = useState<string | null>(billId ?? null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>('xendit')
  const [showConfirm, setShowConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Synchronous guard: a fast double tap can fire twice before the disabled state renders, creating two checkout calls.
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!payableBills.length) return

    setSelectedBillId(current => (
      current && payableBills.some(bill => bill.id === current)
        ? current
        : payableBills[0].id
    ))
  }, [payableBills])

  const displayBill = payableBills.find(bill => bill.id === selectedBillId) ?? payableBills[0]

  if (!displayBill) {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          title={loading ? 'Loading bills...' : 'No payable bills found'}
          description={!loading && loadError ? loadError : undefined}
          action={
            <MobileButton onClick={onBack} className="w-auto">
              Back
            </MobileButton>
          }
        />
      </Screen>
    )
  }

  const handlePay = () => {
    if (!selectedMethod) return
    setError(null)
    setShowConfirm(true)
  }

  const handleConfirmPay = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setProcessing(true)
    setError(null)

    try {
      const data = await apiRequest<{ redirectUrl: string }>('/xendit/checkout', {
        method: 'POST',
        body: JSON.stringify({
          billId: displayBill.id,
          returnUrlBase: getPaymentReturnUrlBase(),
        }),
      })

      if (!data.redirectUrl) {
        throw new Error('Unable to start Xendit Checkout.')
      }

      window.location.assign(data.redirectUrl)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start Xendit Checkout.')
      submittingRef.current = false
      setProcessing(false)
    }
  }

  const handleSelectBill = (nextBillId: string) => {
    setSelectedBillId(nextBillId)
    setError(null)
  }

  const confirmMethod = METHODS.find(m => m.id === selectedMethod)
  // Rendered over the pay screen (absolute, contained in the app frame) rather than replacing it.
  const confirmSheet = showConfirm && confirmMethod ? (
    <div className="absolute inset-0 z-30 flex flex-col bg-foreground/40 backdrop-blur-[2px]">
      <div className="flex-1" onClick={() => !processing && setShowConfirm(false)} />
      <div className="flex flex-col gap-5 rounded-t-3xl border-t border-border bg-card p-6 pb-8">
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-border" />
        <h2 className="text-center text-lg font-semibold tracking-tight text-foreground">Confirm Payment</h2>

        <div className="rounded-2xl border border-border bg-background px-4 py-1">
          <DetailRow label="Bill Period" value={displayBill.month} />
          <DetailRow label="Payment Method" value={confirmMethod.name} />
          <div className="flex items-center justify-between border-t border-border py-3">
            <span className="text-sm font-semibold text-foreground">Total Amount</span>
            <span className="text-lg font-semibold tracking-tight tabular-nums text-foreground">
              {formatPeso(displayBill.amount)}
            </span>
          </div>
        </div>

        {error && (
          <InlineAlert tone="danger" className="text-xs">
            {error}
          </InlineAlert>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Payment will continue on Xendit Checkout.</span>
        </div>

        <div className="space-y-2">
          <MobileButton onClick={handleConfirmPay} disabled={processing} className="tabular-nums">
            {processing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>Continue to Xendit - {formatPeso(displayBill.amount)}</>
            )}
          </MobileButton>
          <MobileButton variant="ghost" onClick={() => setShowConfirm(false)} disabled={processing} className="text-muted-foreground">
            Cancel
          </MobileButton>
        </div>
      </div>
    </div>
  ) : null

  return (
    <Screen>
      <ScreenHeader title="Pay Bill" subtitle={displayBill.month} onBack={onBack} />

      <ScreenBody>
        <MobileCard className="p-5">
          <p className="text-sm text-muted-foreground">Amount Due</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatPeso(displayBill.amount)}
          </p>
        </MobileCard>

        <div>
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">Select Billing Month</h2>
            <span className="text-xs font-semibold text-muted-foreground">{payableBills.length} due</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {payableBills.map(bill => {
              const selected = bill.id === displayBill.id

              return (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => handleSelectBill(bill.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all active:scale-[0.98]',
                    selected ? 'border-primary ring-1 ring-primary' : 'border-border',
                  )}
                >
                  <IconChip icon={CalendarDays} tone={selected ? 'primary' : 'neutral'} />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-foreground">{bill.month}</p>
                    <p className={cn('mt-0.5 text-xs', bill.status === 'overdue' ? 'font-medium text-rose-600' : 'text-muted-foreground')}>
                      {bill.status === 'overdue' ? 'Overdue' : 'Due'} {bill.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold tabular-nums text-foreground">{formatPeso(bill.amount)}</p>
                    {selected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <SectionTitle title="Payment Method" />
          <div className="flex flex-col gap-2.5">
            {METHODS.map(method => {
              const selected = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all active:scale-[0.98]',
                    selected ? 'border-primary ring-1 ring-primary' : 'border-border',
                  )}
                >
                  <IconChip icon={method.icon} tone={method.tone} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">{method.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                  {selected ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <InlineAlert tone="primary" className="flex items-center gap-3 text-xs font-normal text-foreground">
          <Shield className="h-4 w-4 shrink-0 text-primary" />
          <p>CondoEase uses Xendit Checkout and creates a tamper-evident verification reference after confirmation.</p>
        </InlineAlert>

        <MobileButton onClick={handlePay} disabled={!selectedMethod} className="tabular-nums">
          {selectedMethod
            ? `Pay ${formatPeso(displayBill.amount)} via Xendit`
            : 'Select a Payment Method'}
        </MobileButton>
      </ScreenBody>
      {confirmSheet}
    </Screen>
  )
}
