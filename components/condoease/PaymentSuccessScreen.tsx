'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Download, Home, Share2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useMobileData } from './mobile-data'
import { formatPeso, DetailRow, EmptyState, MobileButton, MobileCard, Screen, ScreenBody } from './mobile-kit'
import { downloadPaymentReceipt, fallbackReference, sharePaymentReceipt } from './payment-receipt'

interface PaymentSuccessScreenProps {
  billId: string
  method?: string
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

type PaymentStatusResponse = {
  paid: boolean
  reference?: string
  chainHash?: string
  providerTransactionId?: string
  verification?: {
    verified: boolean
    status: 'verified' | 'invalid' | 'unsealed'
    reason?: string | null
  }
}

const methodLabels: Record<string, string> = {
  xendit: 'Xendit',
}

export function PaymentSuccessScreen({ billId, method = 'xendit', onNavigate }: PaymentSuccessScreenProps) {
  const { bills, tenant, refresh } = useMobileData()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [checking, setChecking] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const bill = bills.find(item => item.id === billId)

  useEffect(() => {
    let cancelled = false

    const loadVerifiedPayment = async () => {
      setChecking(true)
      setLoadError('')

      try {
        const result = await apiRequest<PaymentStatusResponse>(`/xendit/status/${encodeURIComponent(billId)}`, { auth: true })
        if (!cancelled) setPaymentStatus(result)

        if (result.paid) {
          await refresh()
        } else if (!cancelled) {
          setLoadError('Xendit has not confirmed this payment yet. Check your bills again shortly.')
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentStatus(null)
          setLoadError(error instanceof Error ? error.message : 'Unable to confirm this payment.')
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    if (billId) {
      void loadVerifiedPayment()
    } else {
      setLoadError('A payment receipt ID is required.')
      setChecking(false)
    }

    return () => {
      cancelled = true
    }
  }, [billId, refresh])

  if (checking) {
    return (
      <Screen className="items-center justify-center px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-foreground">Confirming your payment with Xendit...</p>
      </Screen>
    )
  }

  if (loadError || !paymentStatus?.paid || !bill) {
    return (
      <Screen className="items-center justify-center px-6">
        <EmptyState
          icon={Clock}
          title="Payment confirmation pending"
          description={<span className="block max-w-sm text-sm">{loadError || 'The paid bill could not be loaded.'}</span>}
          action={
            <MobileButton onClick={() => onNavigate('bills')} className="w-auto">
              Back to Bills
            </MobileButton>
          }
        />
      </Screen>
    )
  }

  const receiptNo = paymentStatus?.reference || bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)
  const verificationHash = paymentStatus?.chainHash || bill.verificationHash
  const providerReference = paymentStatus?.providerTransactionId || bill.providerReference
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <Screen>
      <ScreenBody className="pt-14">
        <div className="flex flex-col items-center px-2 pb-2 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
            <CheckCircle className="h-11 w-11 text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Payment Successful!</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your payment has been processed and confirmed.
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatPeso(bill.amount)}
          </p>
        </div>

        <MobileCard className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-border bg-muted/50 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Verification Reference</p>
              <p className="break-all text-sm font-semibold text-foreground">{receiptNo}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
              <p className="text-xs font-semibold text-foreground">{dateStr}</p>
              <p className="text-xs text-muted-foreground">{timeStr}</p>
            </div>
          </div>

          <div className="px-5 py-2">
            <div className="divide-y divide-border">
              {[
                { label: 'Tenant', value: tenant.name || '-' },
                { label: 'Unit', value: [tenant.unit, tenant.building].filter(Boolean).join(' - ') || '-' },
                { label: 'Bill Period', value: bill.month },
                { label: 'Payment Method', value: methodLabels[method] ?? method },
                { label: 'Payment Hash', value: verificationHash || '-' },
                { label: 'Xendit Transaction', value: providerReference || '-' },
              ].map(row => (
                <DetailRow key={row.label} label={row.label} value={<span className="break-all">{row.value}</span>} />
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border py-3">
              <span className="text-sm font-semibold text-foreground">Amount Paid</span>
              <span className="text-base font-semibold tabular-nums text-emerald-600">
                {formatPeso(bill.amount)}
              </span>
            </div>
          </div>

          <div className="mx-5 mb-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {paymentStatus?.verification?.verified ? 'Payment Chain Verified' : 'Payment Confirmed'}
            </span>
          </div>
        </MobileCard>

        {(paymentStatus?.verification?.reason || actionMessage) && (
          <div className="space-y-2">
            {paymentStatus?.verification?.reason && (
              <p className="text-center text-xs font-medium text-rose-600">{paymentStatus.verification.reason}</p>
            )}
            {actionMessage && (
              <p className="text-center text-xs font-semibold text-primary">{actionMessage}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
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
              variant="outline"
              onClick={() => {
                void downloadPaymentReceipt(bill, tenant)
                  .then(setActionMessage)
                  .catch(() => setActionMessage('Unable to save receipt.'))
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </MobileButton>
          </div>

          <MobileButton onClick={() => onNavigate('home')}>
            <Home className="h-[18px] w-[18px]" />
            Back to Home
          </MobileButton>
        </div>
      </ScreenBody>
    </Screen>
  )
}
