'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ChevronLeft, Download, Share2 } from 'lucide-react'
import { useMobileData } from './mobile-data'
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
      <div className="flex h-full flex-col items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#243660] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold" style={{ color: '#1A2847' }}>Preparing your receipt...</p>
      </div>
    )
  }

  if (!bill || bill.status !== 'paid') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>Paid receipt not found</p>
        {loadError && <p className="mt-2 text-sm" style={{ color: '#5A6A8A' }}>{loadError}</p>}
        <button onClick={onBack} className="mt-4 rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back
        </button>
      </div>
    )
  }

  const reference = bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)

  return (
    <div className="flex h-full flex-col" style={{ background: '#F4F6FA' }}>
      <div
        className="flex items-center justify-between px-5 pb-5 pt-12"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Back</span>
        </button>
        <h1 className="text-base font-bold text-white">Official Receipt</h1>
        <div className="w-16" />
      </div>

      <div className="mobile-scroll flex-1 px-5 py-5">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="px-6 pb-4 pt-6" style={{ background: 'linear-gradient(135deg, #243660, #1a2847)' }}>
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.25)' }}>
                <CheckCircle size={32} color="#22C55E" />
              </div>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Amount Paid</p>
            <p className="mt-1 text-center text-3xl font-bold text-white">
              PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{bill.month}</p>
          </div>

          <div className="relative h-6 bg-white">
            <div className="absolute inset-x-0 top-0 flex h-6">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{
                    background: index % 2 === 0 ? '#243660' : 'white',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-6 py-4">
            {[
              { label: 'Verification Reference', value: reference },
              { label: 'Tenant', value: tenant.name },
              { label: 'Unit', value: tenant.unit },
              { label: 'Payment Date', value: bill.paidDate || '-' },
              { label: 'Chain Sequence', value: bill.chainSequence ? `#${bill.chainSequence}` : '-' },
              { label: 'Payment Hash', value: bill.verificationHash || '-' },
              { label: 'Xendit Transaction', value: bill.providerReference || '-' },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="text-sm" style={{ color: '#9AABC4' }}>{row.label}</span>
                <span className="max-w-[58%] break-all text-right text-sm font-semibold" style={{ color: '#1A2847' }}>{row.value}</span>
              </div>
            ))}

            <div className="border-t pt-3" style={{ borderColor: '#F1F5F9' }}>
              {bill.breakdown.map((item, index) => (
                <div key={index} className="mb-2 flex justify-between">
                  <span className="text-xs" style={{ color: '#5A6A8A' }}>{item.label}</span>
                  <span className="text-xs font-medium" style={{ color: '#1A2847' }}>PHP {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-3" style={{ borderColor: '#E2E8F0' }}>
              <span className="text-base font-bold" style={{ color: '#1A2847' }}>Total</span>
              <span className="text-base font-bold" style={{ color: '#22C55E' }}>
                PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 text-center" style={{ borderTop: '1px dashed #E2E8F0' }}>
            <p className="text-xs font-bold" style={{ color: '#243660' }}>{tenant.building || 'CondoEase'}</p>
            <p className="mt-0.5 text-xs" style={{ color: '#9AABC4' }}>This serves as your official proof of payment.</p>
          </div>
        </div>

        {actionMessage && (
          <p className="mt-4 text-center text-xs font-semibold" style={{ color: '#243660' }}>{actionMessage}</p>
        )}

        <div className="mt-5 flex gap-3">
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
            style={{ background: '#243660', color: 'white' }}
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
