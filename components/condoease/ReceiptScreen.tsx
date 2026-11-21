'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Download, Receipt, Share2 } from 'lucide-react'
import { useMobileData } from './mobile-data'
import { DetailRow, EmptyState, MobileButton, MobileCard, Screen, ScreenBody, ScreenHeader } from './mobile-kit'
import { downloadPaymentReceipt, fallbackReference, sharePaymentReceipt } from './payment-receipt'
import { apiRequest } from '@/lib/api'

interface ReceiptScreenProps {
  billId: string
  onBack: () => void
  autoConfirmed?: boolean
}

export function ReceiptScreen({ billId, onBack, autoConfirmed = false }: ReceiptScreenProps) {
  const { bills, tenant, refresh } = useMobileData()
  const [actionMessage, setActionMessage] = useState('')
  const [checking, setChecking] = useState(autoConfirmed)
  const [loadError, setLoadError] = useState('')
  const bill = bills.find(item => item.id === billId)

  useEffect(() => {
    let cancelled = false

    async function verifyAndRefresh() {
      if (!billId) return
      if (bill?.status === 'paid' && !autoConfirmed) return

      setChecking(true)
      setLoadError('')

      try {
        const maxAttempts = autoConfirmed ? 8 : 1

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const result = await apiRequest<{ paid: boolean }>(`/xendit/status/${encodeURIComponent(billId)}`, { auth: true })
          await refresh()

          if (cancelled || result.paid) return
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 2500))
          }
        }

        if (!cancelled) setLoadError('Payment is still being confirmed. Please open your bills again in a moment.')
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load receipt.')
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    void verifyAndRefresh()

    return () => {
      cancelled = true
    }
  }, [autoConfirmed, bill?.status, billId, refresh])

  if (checking) {
    return (
      <Screen className="items-center justify-center px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-foreground">Preparing your receipt...</p>
      </Screen>
    )
  }

  if (!bill || bill.status !== 'paid') {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          icon={Receipt}
          title="Paid receipt not found"
          description={loadError ? <span className="block text-sm">{loadError}</span> : undefined}
          action={
            <MobileButton onClick={onBack} className="w-auto">
              Back
            </MobileButton>
          }
        />
      </Screen>
    )
  }

  const reference = bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)

  return (
    <Screen>
      <ScreenHeader title="Official Receipt" onBack={onBack} />

      <ScreenBody>
        <MobileCard className="overflow-hidden">
          <div className="flex flex-col items-center border-b border-dashed border-border px-6 pb-5 pt-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{bill.month}</p>
          </div>

          <div className="px-6 py-2">
            <div className="divide-y divide-border">
              {[
                { label: 'Verification Reference', value: reference },
                { label: 'Tenant', value: tenant.name },
                { label: 'Unit', value: tenant.unit },
                { label: 'Payment Date', value: bill.paidDate || '-' },
                { label: 'Chain Sequence', value: bill.chainSequence ? `#${bill.chainSequence}` : '-' },
                { label: 'Payment Hash', value: bill.verificationHash || '-' },
                { label: 'Xendit Transaction', value: bill.providerReference || '-' },
              ].map(row => (
                <DetailRow key={row.label} label={row.label} value={<span className="break-all">{row.value}</span>} />
              ))}
            </div>

            <div className="space-y-2 border-t border-border py-3">
              {bill.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums text-foreground">PHP {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border py-3">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-base font-semibold tabular-nums text-emerald-600">
                PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-border bg-muted/50 px-6 py-4 text-center">
            <p className="text-xs font-semibold text-primary">{tenant.building || 'CondoEase'}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">This serves as your official proof of payment.</p>
          </div>
        </MobileCard>

        {actionMessage && (
          <p className="text-center text-xs font-semibold text-primary">{actionMessage}</p>
        )}

        <div className="flex gap-3">
          <MobileButton
            variant="outline"
            onClick={() => {
              void sharePaymentReceipt(bill, tenant)
                .then(setActionMessage)
                .catch(() => setActionMessage('Unable to share receipt.'))
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </MobileButton>
          <MobileButton
            onClick={() => {
              downloadPaymentReceipt(bill, tenant)
              setActionMessage('Receipt downloaded.')
            }}
          >
            <Download className="h-4 w-4" />
            Download
          </MobileButton>
        </div>
      </ScreenBody>
    </Screen>
  )
}
