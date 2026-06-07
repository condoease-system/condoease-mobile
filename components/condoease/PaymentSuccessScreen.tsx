'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Download, Home, Share2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useMobileData } from './mobile-data'
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
      <div className="flex h-full flex-col items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#243660] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold" style={{ color: '#1A2847' }}>Confirming your payment with Xendit...</p>
      </div>
    )
  }

  if (loadError || !paymentStatus?.paid || !bill) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>Payment confirmation pending</p>
        <p className="mt-2 max-w-sm text-sm" style={{ color: '#5A6A8A' }}>
          {loadError || 'The paid bill could not be loaded.'}
        </p>
        <button
          onClick={() => onNavigate('bills')}
          className="mt-5 rounded-2xl px-5 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: '#243660' }}
        >
          Back to Bills
        </button>
      </div>
    )
  }

  const receiptNo = paymentStatus?.reference || bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)
  const verificationHash = paymentStatus?.chainHash || bill.verificationHash
  const providerReference = paymentStatus?.providerTransactionId || bill.providerReference
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mobile-scroll flex h-full flex-col" style={{ background: '#F4F6FA' }}>
      <div
        className="flex flex-col items-center px-5 pb-8 pt-14"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}>
          <CheckCircle size={44} color="#22C55E" />
        </div>
        <h1 className="text-xl font-bold text-white">Payment Successful!</h1>
        <p className="mt-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Your payment has been processed and confirmed.
        </p>
        <p className="mt-4 text-3xl font-bold" style={{ color: '#FF8A1C' }}>
          PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mx-5 mt-5">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="px-5 py-4" style={{ background: '#F8FAFC', borderBottom: '1.5px dashed #E2E8F0' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#9AABC4' }}>Verification Reference</p>
                <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{receiptNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium" style={{ color: '#9AABC4' }}>Date & Time</p>
                <p className="text-xs font-semibold" style={{ color: '#1A2847' }}>{dateStr}</p>
                <p className="text-xs" style={{ color: '#9AABC4' }}>{timeStr}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4">
            {[
              { label: 'Tenant', value: tenant.name },
              { label: 'Unit', value: [tenant.unit, tenant.building].filter(Boolean).join(' - ') },
              { label: 'Bill Period', value: bill.month },
              { label: 'Payment Method', value: methodLabels[method] ?? method },
              { label: 'Payment Hash', value: verificationHash || '-' },
              { label: 'Xendit Transaction', value: providerReference || '-' },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-4">
                <span className="text-sm" style={{ color: '#5A6A8A' }}>{row.label}</span>
                <span className="max-w-[58%] break-all text-right text-sm font-semibold" style={{ color: '#1A2847' }}>{row.value}</span>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: '#F1F5F9' }}>
              <span className="text-base font-bold" style={{ color: '#1A2847' }}>Amount Paid</span>
              <span className="text-base font-bold" style={{ color: '#22C55E' }}>
                PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mx-5 mb-5 flex items-center justify-center gap-2 rounded-xl py-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <CheckCircle size={16} color="#22C55E" />
            <span className="text-sm font-bold" style={{ color: '#22C55E' }}>
              {paymentStatus?.verification?.verified ? 'Payment Chain Verified' : 'Payment Confirmed'}
            </span>
          </div>
        </div>
      </div>

      {paymentStatus?.verification?.reason && (
        <p className="mx-5 mt-3 text-center text-xs font-medium" style={{ color: '#DC2626' }}>{paymentStatus.verification.reason}</p>
      )}
      {actionMessage && (
        <p className="mx-5 mt-3 text-center text-xs font-semibold" style={{ color: '#243660' }}>{actionMessage}</p>
      )}

      <div className="mx-5 mt-5 flex gap-3">
        <button
          onClick={() => {
            void sharePaymentReceipt(bill, tenant)
              .then(setActionMessage)
              .catch(() => setActionMessage('Unable to share receipt.'))
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
          style={{ background: '#EEF2FF', color: '#243660', border: '1.5px solid #C7D2FE' }}
        >
          <Share2 size={16} />
          Share
        </button>
        <button
          onClick={() => {
            downloadPaymentReceipt(bill, tenant)
            setActionMessage('Receipt downloaded.')
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
          style={{ background: '#F0FDF4', color: '#22C55E', border: '1.5px solid #BBF7D0' }}
        >
          <Download size={16} />
          Download
        </button>
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="mx-5 mb-6 mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white active:opacity-80"
        style={{ backgroundColor: '#243660' }}
      >
        <Home size={18} />
        Back to Home
      </button>
    </div>
  )
}
