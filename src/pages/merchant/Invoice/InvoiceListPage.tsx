import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices } from '@/hooks/merchant/Invoice/useInvoices'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'
import { ROUTES } from '@/constants/routes'
import { InvoiceStatus } from '@/types'

const STATUS_OPTIONS: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'EXPIRED', label: 'Kedaluwarsa' },
]

export default function InvoiceListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<InvoiceStatus | ''>('')

  const { invoices, meta, isLoading, error } = useInvoices({ page, limit: 10, status })

  const handleStatusChange = (val: string) => {
    setStatus(val as InvoiceStatus | '')
    setPage(1)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola semua invoice merchant</p>
        </div>
        <Link
          to={ROUTES.MERCHANT_INVOICE_CREATE}
          className="
            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
            bg-blue-600 text-white hover:bg-blue-700 transition-colors
            self-start sm:self-auto
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Invoice
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
              Filter Status
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                    ${status === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {isLoading ? (
          <LoadingSpinner message="Memuat invoice..." />
        ) : error ? (
          <div className="p-5">
            <ErrorMessage message={error} />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            message="Belum ada invoice"
            description={status ? `Tidak ada invoice dengan status ${getStatusLabel(status as InvoiceStatus)}` : 'Buat invoice pertama kamu'}
            action={
              <Link
                to={ROUTES.MERCHANT_INVOICE_CREATE}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Buat invoice
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['No. Invoice', 'Customer', 'Jumlah', 'Due Date', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-blue-600">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{inv.customer_name}</p>
                        <p className="text-xs text-gray-400">{inv.customer_email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          label={getStatusLabel(inv.status)}
                          variant={getStatusVariant(inv.status)}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.MERCHANT_INVOICE_DETAIL.replace(':id', inv.id)}
                          className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
                        >
                          Lihat detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={ROUTES.MERCHANT_INVOICE_DETAIL.replace(':id', inv.id)}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-blue-600">{inv.invoice_number}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{inv.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{inv.customer_email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(inv.due_date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(inv.amount)}
                    </span>
                    <Badge
                      label={getStatusLabel(inv.status)}
                      variant={getStatusVariant(inv.status)}
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta && (
              <div className="px-5 py-4 border-t border-gray-100">
                <Pagination meta={meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}