import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInvoiceDetail } from '@/hooks/merchant/Invoice/useInvoiceDetail'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'
import { ROUTES } from '@/constants/routes'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { invoice, isLoading, error } = useInvoiceDetail(id ?? '')
  const [copied, setCopied] = useState(false)

  const paymentUrl = invoice
    ? `${window.location.origin}/pay/${invoice.payment_link_token}`
    : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback untuk browser yang tidak support clipboard API
      const input = document.createElement('input')
      input.value = paymentUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) return <LoadingSpinner message="Memuat detail invoice..." />

  if (error || !invoice) return (
    <div className="max-w-md space-y-4">
      <ErrorMessage message={error ?? 'Invoice tidak ditemukan.'} />
      <Link
        to={ROUTES.MERCHANT_INVOICES}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke daftar invoice
      </Link>
    </div>
  )

  return (
    <div className="max-w-full space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.MERCHANT_INVOICES}
          aria-label="Kembali"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900">Detail Invoice</h2>
            <Badge
              label={getStatusLabel(invoice.status)}
              variant={getStatusVariant(invoice.status)}
            />
          </div>
          <p className="text-sm font-mono text-gray-400 mt-0.5">{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Invoice header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Total Pembayaran
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Due Date
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div className="px-6 py-5 space-y-4">

          {/* Customer info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Informasi Customer
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nama</p>
                <p className="text-sm font-medium text-gray-800">{invoice.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-800">{invoice.customer_email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Invoice info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Detail Invoice
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nomor Invoice</p>
                <p className="text-sm font-mono font-medium text-gray-800">
                  {invoice.invoice_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Tanggal Dibuat</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(invoice.created_at)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Deskripsi</p>
                <p className="text-sm font-medium text-gray-800">{invoice.description}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payment link card */}
      {invoice.status === 'PENDING' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Payment Link</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Bagikan link ini ke customer untuk melakukan pembayaran
            </p>
          </div>

          {/* Link preview */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <p
                className="text-xs font-mono text-gray-600 truncate"
                data-testid="payment-url"
              >
                {paymentUrl}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              aria-label="Salin payment link"
              className={`
                shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium
                border transition-all duration-150
                ${copied
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersalin!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Salin Link
                </>
              )}
            </button>
          </div>

          {/* Open in new tab */}
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2 text-xs text-blue-600
              hover:underline font-medium
            "
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Buka halaman pembayaran
          </a>
        </div>
      )}

      {/* Paid info */}
      {invoice.status === 'PAID' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Invoice Sudah Lunas</p>
            <p className="text-xs text-green-600 mt-0.5">
              Pembayaran telah berhasil diterima.
            </p>
          </div>
        </div>
      )}

      {/* Expired info */}
      {invoice.status === 'EXPIRED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Invoice Kedaluwarsa</p>
            <p className="text-xs text-red-600 mt-0.5">
              Invoice ini sudah melewati due date dan tidak bisa dibayar.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}