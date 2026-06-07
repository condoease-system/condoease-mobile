'use client'

import { ChevronLeft, CreditCard, Receipt } from 'lucide-react'
import { useMobileData } from './mobile-data'

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
      <div className="flex h-full flex-col items-center justify-center px-6 text-center" style={{ background: '#F4F6FA' }}>
        <p className="text-base font-bold" style={{ color: '#1A2847' }}>Bill not found</p>
        <button onClick={onBack} className="mt-4 rounded-2xl px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: '#243660' }}>
          Back to Bills
        </button>
      </div>
    )
  }

  const statusStyle = bill.status === 'paid'
    ? { bg: '#F0FDF4', text: '#22C55E', label: 'Paid' }
    : bill.status === 'overdue'
      ? { bg: '#FFF1F0', text: '#EF4444', label: 'Overdue' }
      : { bg: '#FFF3E0', text: '#FF8A1C', label: 'Unpaid' }

  return (
    <div className="flex h-full flex-col" style={{ background: '#F4F6FA' }}>
      <div
        className="px-5 pb-6 pt-12"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <button onClick={onBack} className="mb-4 flex items-center gap-2">
          <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Bills</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{bill.month}</h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {bill.status === 'paid' ? `Paid on ${bill.paidDate}` : `Due ${bill.dueDate}`}
            </p>
          </div>
          <span className="rounded-full px-3 py-1.5 text-sm font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
            {statusStyle.label}
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">
          PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mobile-scroll flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold" style={{ color: '#1A2847' }}>Bill Breakdown</p>
          <div className="flex flex-col gap-3">
            {bill.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#5A6A8A' }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: '#1A2847' }}>PHP {item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F1F5F9' }}>
              <span className="text-base font-bold" style={{ color: '#1A2847' }}>Total Due</span>
              <span className="text-base font-bold" style={{ color: '#243660' }}>
                PHP {bill.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {bill.status === 'paid' && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold" style={{ color: '#1A2847' }}>Payment Details</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Verification Reference', value: bill.referenceCode || bill.receiptNumber || '-' },
                { label: 'Payment Date', value: bill.paidDate || '-' },
                { label: 'Payment Hash', value: bill.verificationHash || '-' },
                { label: 'Amount Paid', value: `PHP ${bill.amount.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-sm" style={{ color: '#5A6A8A' }}>{row.label}</span>
                  <span className="max-w-[58%] break-all text-right text-sm font-semibold" style={{ color: '#1A2847' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {bill.status === 'overdue' && (
          <div className="rounded-2xl p-4" style={{ background: '#FFF1F0', border: '1px solid #FECACA' }}>
            <p className="text-sm font-bold" style={{ color: '#EF4444' }}>Warning: this bill is overdue</p>
            <p className="mt-1 text-xs" style={{ color: '#7F1D1D' }}>
              Late payment surcharge of 2% per month may apply. Please settle immediately to avoid penalties.
            </p>
          </div>
        )}

        {bill.status !== 'paid' ? (
          <button
            onClick={() => onNavigate('pay-bill', { billId: bill.id })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition-opacity active:opacity-80"
            style={{ backgroundColor: '#243660' }}
          >
            <CreditCard size={20} />
            Pay This Bill
          </button>
        ) : (
          <button
            onClick={() => onNavigate('receipt', { billId: bill.id })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-opacity active:opacity-80"
            style={{ backgroundColor: '#F0FDF4', color: '#22C55E', border: '1.5px solid #BBF7D0' }}
          >
            <Receipt size={20} />
            View Receipt
          </button>
        )}
      </div>
    </div>
  )
}
