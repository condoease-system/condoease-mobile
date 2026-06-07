'use client'

import { CheckCircle, Receipt, TrendingUp } from 'lucide-react'
import { useMobileData } from './mobile-data'

interface PaymentHistoryScreenProps {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void
}

export function PaymentHistoryScreen({ onNavigate }: PaymentHistoryScreenProps) {
  const { bills } = useMobileData()
  const paidBills = bills.filter(b => b.status === 'paid')
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="flex flex-col h-full" style={{ background: '#F4F6FA' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(150deg, #1a2847 0%, #243660 100%)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <h1 className="text-xl font-bold text-white mb-1">Payment History</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Your completed payments</p>

        {/* Stats */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <TrendingUp size={16} color="#FF8A1C" />
            <p className="text-xl font-bold text-white mt-1">₱{totalPaid.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Paid</p>
          </div>
          <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CheckCircle size={16} color="#22C55E" />
            <p className="text-xl font-bold text-white mt-1">{paidBills.length}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Bills Settled</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 mobile-scroll px-5 py-5 flex flex-col gap-3">
        {paidBills.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
              <Receipt size={28} color="#243660" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#9AABC4' }}>No payment history yet</p>
          </div>
        )}
        {paidBills.map(bill => (
          <button
            key={bill.id}
            onClick={() => onNavigate('receipt', { billId: bill.id })}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F0FDF4' }}>
              <CheckCircle size={22} color="#22C55E" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: '#1A2847' }}>{bill.month}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9AABC4' }}>Paid {bill.paidDate}</p>
              {bill.receiptNumber && (
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#243660' }}>{bill.receiptNumber}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-base font-bold" style={{ color: '#22C55E' }}>
                ₱{bill.amount.toLocaleString()}
              </p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: '#9AABC4' }}>View</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
