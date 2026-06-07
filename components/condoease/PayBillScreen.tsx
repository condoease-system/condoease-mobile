'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, Check, CreditCard, Shield, ChevronRight } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useMobileData } from './mobile-data'

interface PayBillScreenProps {
  billId?: string
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
  onBack: () => void
}

const METHODS = [
  { id: 'xendit', name: 'Xendit', desc: 'Pay securely via Xendit Checkout', icon: CreditCard, color: '#4573FF', bg: '#EEF2FF' },
]

function getPaymentReturnUrlBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "")
  if (configuredUrl) return configuredUrl

  const origin = window.location.origin
  if (origin.startsWith('https://') || origin.startsWith('http://localhost')) return origin

  return 'https://condoease.vercel.app'
}

export function PayBillScreen({ billId, onBack }: PayBillScreenProps) {
  const { bills } = useMobileData()
  const payableBills = useMemo(() => bills.filter(bill => bill.status !== 'paid'), [bills])
  const [selectedBillId, setSelectedBillId] = useState<string | null>(billId ?? null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>('xendit')
  const [showConfirm, setShowConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <div className="flex flex-col h-full items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>No payable bills found</p>
        <button onClick={onBack} className="mt-4 px-5 py-3 rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back
        </button>
      </div>
    )
  }

  const handlePay = () => {
    if (!selectedMethod) return
    setError(null)
    setShowConfirm(true)
  }

  const handleConfirmPay = async () => {
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
      setProcessing(false)
    }
  }

  const handleSelectBill = (nextBillId: string) => {
    setSelectedBillId(nextBillId)
    setError(null)
  }

  if (showConfirm) {
    const method = METHODS.find(m => m.id === selectedMethod)!
    return (
      <div className="flex flex-col h-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="flex-1" onClick={() => !processing && setShowConfirm(false)} />
        <div className="bg-white rounded-t-3xl p-6 flex flex-col gap-5">
          <div className="w-12 h-1 rounded-full mx-auto mb-2" style={{ backgroundColor: '#E2E8F0' }} />
          <h2 className="text-lg font-bold text-center" style={{ color: '#1A2847' }}>Confirm Payment</h2>

          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#F4F6FA' }}>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: '#5A6A8A' }}>Bill Period</span>
              <span className="text-sm font-semibold" style={{ color: '#1A2847' }}>{displayBill.month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: '#5A6A8A' }}>Payment Method</span>
              <span className="text-sm font-semibold" style={{ color: '#1A2847' }}>{method.name}</span>
            </div>
            <div className="border-t pt-3 flex justify-between" style={{ borderColor: '#E2E8F0' }}>
              <span className="text-base font-bold" style={{ color: '#1A2847' }}>Total Amount</span>
              <span className="text-base font-bold" style={{ color: '#243660' }}>
                PHP {displayBill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl p-3 text-xs font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs" style={{ color: '#9AABC4' }}>
            <Shield size={14} />
            <span>Payment will continue on Xendit Checkout.</span>
          </div>

          <button
            onClick={handleConfirmPay}
            disabled={processing}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 active:opacity-80"
            style={{ backgroundColor: '#243660' }}
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Continue to Xendit - PHP {displayBill.amount.toLocaleString()}</>
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={processing}
            className="w-full py-3 text-sm font-semibold"
            style={{ color: '#9AABC4' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="flex items-center gap-2 mb-4">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Back</span>
        </button>
        <h1 className="text-xl font-bold text-white">Pay Bill</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{displayBill.month}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Amount Due</span>
          <span className="text-2xl font-bold" style={{ color: '#FF8A1C' }}>
            PHP {displayBill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Select Billing Month</p>
          <span className="text-xs font-semibold" style={{ color: '#9AABC4' }}>{payableBills.length} due</span>
        </div>

        <div className="flex flex-col gap-3">
          {payableBills.map(bill => {
            const selected = bill.id === displayBill.id

            return (
              <button
                key={bill.id}
                type="button"
                onClick={() => handleSelectBill(bill.id)}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
                style={{
                  border: selected ? '2px solid #FF8A1C' : '2px solid transparent',
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: selected ? '#FFF3E0' : '#F4F6FA' }}>
                  <CalendarDays size={20} color={selected ? '#FF8A1C' : '#9AABC4'} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#1A2847' }}>{bill.month}</p>
                  <p className="text-xs mt-0.5" style={{ color: bill.status === 'overdue' ? '#DC2626' : '#9AABC4' }}>
                    {bill.status === 'overdue' ? 'Overdue' : 'Due'} {bill.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#243660' }}>PHP {bill.amount.toLocaleString()}</p>
                  {selected && (
                    <div className="ml-auto mt-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF8A1C' }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-sm font-bold" style={{ color: '#1A2847' }}>Payment Method</p>

        <div className="flex flex-col gap-3">
          {METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
              style={{
                border: selectedMethod === method.id ? `2px solid ${method.color}` : '2px solid transparent',
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: method.bg }}>
                <method.icon size={22} color={method.color} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{method.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>{method.desc}</p>
              </div>
              {selectedMethod === method.id ? (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: method.color }}>
                  <Check size={14} color="white" />
                </div>
              ) : (
                <ChevronRight size={18} color="#9AABC4" />
              )}
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
          <Shield size={18} color="#243660" />
          <p className="text-xs" style={{ color: '#1A2847' }}>
            CondoEase uses Xendit Checkout and creates a tamper-evident verification reference after confirmation.
          </p>
        </div>

        <button
          onClick={handlePay}
          disabled={!selectedMethod}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:opacity-80"
          style={{ backgroundColor: selectedMethod ? '#243660' : '#C7D2FE' }}
        >
          {selectedMethod
            ? `Pay PHP ${displayBill.amount.toLocaleString()} via Xendit`
            : 'Select a Payment Method'}
        </button>
      </div>
    </div>
  )
}
