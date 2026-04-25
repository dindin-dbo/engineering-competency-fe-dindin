import { useParams } from 'react-router-dom'
import { usePayment } from '@/hooks/public/usePayment'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'
import { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; desc: string; icon: string }[] = [
  {
    value: 'WALLET',
    label: 'Wallet',
    desc: 'Bayar menggunakan saldo wallet',
    icon: 'W',
  },
  {
    value: 'VA_DUMMY',
    label: 'Virtual Account',
    desc: 'Transfer via virtual account bank',
    icon: 'VA',
  },
  {
    value: 'EWALLET_DUMMY',
    label: 'E-Wallet',
    desc: 'Bayar via e-wallet (GoPay, OVO, dll)',
    icon: 'E',
  },
]

export default function PaymentPage() {
  const { token } = useParams<{ token: string }>()

  const {
    invoice,
    paymentIntent,
    isLoadingInvoice,
    isSubmitting,
    error,
    selectedMethod,
    setSelectedMethod,
    handlePay,
  } = usePayment(token ?? '')

  if (isLoadingInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Memuat halaman pembayaran..." />
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-md mx-auto space-y-4">

        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-sm">Payment Sandbox</span>
        </div>

        {/* Invoice card */}
        {invoice && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-gray-400">{invoice.invoice_number}</p>
                <Badge
                  label={getStatusLabel(invoice.status)}
                  variant={getStatusVariant(invoice.status)}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(invoice.amount)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">{invoice.description}</p>
            </div>

            <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Kepada</p>
                <p className="font-medium text-gray-800">{invoice.customer_name}</p>
                <p className="text-xs text-gray-400">{invoice.customer_email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                <p className="font-medium text-gray-800">{formatDate(invoice.due_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment status — PAID */}
        {invoice?.status === 'PAID' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-green-800">Pembayaran Berhasil!</p>
            <p className="text-sm text-green-600">
              Invoice ini sudah lunas. Terima kasih.
            </p>
          </div>
        )}

        {/* Payment status — EXPIRED */}
        {invoice?.status === 'EXPIRED' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-red-800">Invoice Kedaluwarsa</p>
            <p className="text-sm text-red-600">
              Invoice ini sudah melewati due date.
            </p>
          </div>
        )}

        {/* Payment intent status — PENDING */}
        {paymentIntent?.status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-2">
            <div className="w-8 h-8 mx-auto">
              <svg className="animate-spin w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <p className="font-semibold text-amber-800">Menunggu Konfirmasi</p>
            <p className="text-sm text-amber-600">
              Pembayaran sedang diproses oleh admin sandbox.
            </p>
            <p className="text-xs text-amber-500 font-mono">
              Intent ID: {paymentIntent.id}
            </p>
          </div>
        )}

        {/* Payment intent status — FAILED */}
        {paymentIntent?.status === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-800">Pembayaran Gagal</p>
            <p className="text-xs text-red-600 mt-0.5">
              Silakan coba lagi dengan metode pembayaran lain.
            </p>
          </div>
        )}

        {/* Payment form — only show when PENDING invoice and no active intent */}
        {invoice?.status === 'PENDING' && !paymentIntent && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Pilih Metode Pembayaran</p>

            {error && <ErrorMessage message={error} />}

            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className={`
                    w-full flex items-center gap-3 p-3.5 rounded-xl border text-left
                    transition-all duration-150
                    ${selectedMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                    ${selectedMethod === method.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                    }
                  `}>
                    {method.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${
                      selectedMethod === method.value ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {method.label}
                    </p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                  {selectedMethod === method.value && (
                    <svg className="w-4 h-4 text-blue-500 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={!selectedMethod || isSubmitting}
              className="
                w-full py-3 rounded-xl text-sm font-semibold text-white
                bg-blue-600 hover:bg-blue-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {isSubmitting ? 'Memproses...' : `Bayar ${formatCurrency(invoice.amount)}`}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Sandbox environment — tidak ada transaksi nyata
            </p>
          </div>
        )}

      </div>
    </div>
  )
}