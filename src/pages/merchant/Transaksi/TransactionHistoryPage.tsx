import { useState } from 'react'
import {
  useTransactionHistory,
  TransactionType,
} from '@/hooks/merchant/Transaksi/useTransactionHistory'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

type FilterType = TransactionTypeInterface | 'ALL'
// Assuming TransactionTypeInterface is properly defined elsewhere
type TransactionTypeInterface = 'PAYMENT_IN' | 'TOPUP_IN' | 'REFUND_OUT';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PAYMENT_IN', label: 'Pembayaran Masuk' },
  { value: 'TOPUP_IN', label: 'Top-up' },
  { value: 'REFUND_OUT', label: 'Refund Keluar' },
]

const TYPE_CONFIG: Record<TransactionTypeInterface, { label: string; color: string; bgColor: string; sign: string }> = {
  PAYMENT_IN: {
    label: 'Pembayaran',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    sign: '+',
  },
  TOPUP_IN: {
    label: 'Top-up',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    sign: '+',
  },
  REFUND_OUT: {
    label: 'Refund',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    sign: '-',
  },
}

function TypeIcon({ type }: { type: TransactionType }) {
  const config = TYPE_CONFIG[type]

  const icons: Record<TransactionType, React.ReactNode> = {
    PAYMENT_IN: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
    TOPUP_IN: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    REFUND_OUT: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  }

  return (
    <div className={`
      w-9 h-9 rounded-xl ${config.bgColor} ${config.color}
      flex items-center justify-center shrink-0
    `}>
      {icons[type]}
    </div>
  )
}

function SummaryCard({
  label,
  amount,
  color,
  count,
}: {
  label: string
  amount: number
  color: string
  count: number
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{formatCurrency(amount)}</p>
      <p className="text-xs text-gray-400 mt-0.5">{count} transaksi</p>
    </div>
  )
}

export default function TransactionHistoryPage() {
  const { transactions, isLoading, error } = useTransactionHistory()
  const [filter, setFilter] = useState<FilterType>('ALL')

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter((t) => t.type === filter)

  const totalIn = transactions
    .filter((t) => t.type === 'PAYMENT_IN' || t.type === 'TOPUP_IN')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = transactions
    .filter((t) => t.type === 'REFUND_OUT')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPayment = transactions
    .filter((t) => t.type === 'PAYMENT_IN')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalTopup = transactions
    .filter((t) => t.type === 'TOPUP_IN')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalRefund = transactions
    .filter((t) => t.type === 'REFUND_OUT')
    .reduce((sum, t) => sum + t.amount, 0)

  if (isLoading) return <LoadingSpinner message="Memuat riwayat transaksi..." />

  if (error) return (
    <div className="max-w-md">
      <ErrorMessage message={error} />
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Pembayaran Masuk"
          amount={totalPayment}
          color="text-green-600"
          count={transactions.filter((t) => t.type === 'PAYMENT_IN').length}
        />
        <SummaryCard
          label="Total Top-up"
          amount={totalTopup}
          color="text-blue-600"
          count={transactions.filter((t) => t.type === 'TOPUP_IN').length}
        />
        <SummaryCard
          label="Total Refund Keluar"
          amount={totalRefund}
          color="text-red-500"
          count={transactions.filter((t) => t.type === 'REFUND_OUT').length}
        />
      </div>

      {/* Net balance card */}
      <div className="bg-slate-900 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Net Arus Kas
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            totalIn - totalOut >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalIn - totalOut >= 0 ? '+' : ''}{formatCurrency(totalIn - totalOut)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{transactions.length} total transaksi</p>
        </div>
      </div>

      {/* Filter + List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Filter bar */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                ${filter === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} transaksi
          </span>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <EmptyState
            message="Tidak ada transaksi"
            description={
              filter === 'ALL'
                ? 'Belum ada aktivitas transaksi'
                : `Tidak ada transaksi dengan tipe ${FILTER_OPTIONS.find(o => o.value === filter)?.label}`
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Transaksi', 'Referensi', 'Tanggal', 'Jumlah'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((tx) => {
                    const config = TYPE_CONFIG[tx.type]
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <TypeIcon type={tx.type} />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {tx.description}
                              </p>
                              <span className={`
                                text-xs font-medium px-1.5 py-0.5 rounded
                                ${config.bgColor} ${config.color}
                              `}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-gray-500">
                            {tx.reference}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-semibold ${config.color}`}>
                            {config.sign}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((tx) => {
                const config = TYPE_CONFIG[tx.type]
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-4">
                    <TypeIcon type={tx.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        {tx.reference}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${config.color}`}>
                        {config.sign}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`
                        text-xs font-medium px-1.5 py-0.5 rounded mt-1 inline-block
                        ${config.bgColor} ${config.color}
                      `}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

    </div>
  )
}