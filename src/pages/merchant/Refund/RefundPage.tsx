import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { refundSchema, RefundFormValues } from '@/utils/validations/refundSchema'
import { useRefund } from '@/hooks/merchant/Refund/useRefund'
import { useInvoices } from '@/hooks/merchant/Invoice/useInvoices'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'

export default function RefundPage() {
  const [showForm, setShowForm] = useState(false)

  const {
    refunds,
    isLoading,
    isSubmitting,
    error,
    submitError,
    submitSuccess,
    handleCreateRefund,
  } = useRefund()

  // Hanya invoice berstatus PAID yang bisa direfund
  const { invoices: paidInvoices } = useInvoices({ status: 'PAID', limit: 100 })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: { invoice_id: '', reason: '' },
  })

  const onSubmit = async (data: RefundFormValues) => {
    await handleCreateRefund(data)
    reset()
    setShowForm(false)
  }

  if (isLoading) return <LoadingSpinner message="Memuat data refund..." />

  if (error) return (
    <div className="max-w-md">
      <ErrorMessage message={error} />
    </div>
  )

  return (
    <div className="space-y-5 max-w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Refund</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Ajukan dan pantau status refund
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="
            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
            bg-blue-600 text-white hover:bg-blue-700 transition-colors
            self-start sm:self-auto
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Batal' : 'Ajukan Refund'}
        </button>
      </div>

      {/* Request refund form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Form Pengajuan Refund</h3>

          {submitSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-medium">
                Refund berhasil diajukan!
              </p>
            </div>
          )}

          {submitError && <ErrorMessage message={submitError} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Invoice select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invoice_id" className="text-sm font-medium text-gray-700">
                Pilih Invoice
              </label>
              <select
                id="invoice_id"
                className={`
                  w-full px-4 py-2.5 rounded-lg border text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-150
                  ${errors.invoice_id
                    ? 'border-red-400 text-red-900'
                    : 'border-gray-300 text-gray-900'
                  }
                `}
                {...register('invoice_id')}
              >
                <option value="">-- Pilih invoice yang ingin direfund --</option>
                {paidInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — {inv.customer_name} —{' '}
                    {formatCurrency(inv.amount)}
                  </option>
                ))}
              </select>
              {errors.invoice_id && (
                <p className="text-xs text-red-500">{errors.invoice_id.message}</p>
              )}
              {paidInvoices.length === 0 && (
                <p className="text-xs text-gray-400">
                  Tidak ada invoice dengan status PAID
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Alasan Refund
              </label>
              <textarea
                id="reason"
                rows={3}
                placeholder="Jelaskan alasan pengajuan refund..."
                className={`
                  w-full px-4 py-2.5 rounded-lg border text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-150
                  ${errors.reason
                    ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }
                `}
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-xs text-red-500">{errors.reason.message}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); reset() }}
                className="
                  px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300
                  text-gray-700 hover:bg-gray-50 transition-colors
                "
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  px-6 py-2.5 rounded-lg text-sm font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                "
              >
                {isSubmitting && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {isSubmitting ? 'Mengajukan...' : 'Ajukan Refund'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Refund list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Riwayat Refund</h3>
        </div>

        {refunds.length === 0 ? (
          <EmptyState
            message="Belum ada pengajuan refund"
            description="Klik tombol 'Ajukan Refund' untuk membuat pengajuan baru"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['No. Invoice', 'Jumlah', 'Alasan', 'Tanggal', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-blue-600">
                          {refund.invoice_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                        {formatCurrency(refund.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">
                        {refund.reason}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(refund.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          label={getStatusLabel(refund.status)}
                          variant={getStatusVariant(refund.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {refunds.map((refund) => (
                <div key={refund.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-blue-600">
                        {refund.invoice_number}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {formatCurrency(refund.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {refund.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(refund.created_at)}
                      </p>
                    </div>
                    <Badge
                      label={getStatusLabel(refund.status)}
                      variant={getStatusVariant(refund.status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}