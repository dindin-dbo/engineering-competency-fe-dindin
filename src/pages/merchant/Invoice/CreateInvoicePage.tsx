import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInvoiceSchema, CreateInvoiceFormValues } from '@/utils/validations/invoiceSchema'
import { useCreateInvoice } from '@/hooks/merchant/Invoice/useCreateInvoice'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { ROUTES } from '@/constants/routes'

export default function CreateInvoicePage() {
  const { handleCreate, isLoading, errorMessage } = useCreateInvoice()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      amount: 0,
      description: '',
      due_date: '',
    },
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={ROUTES.MERCHANT_INVOICES}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Kembali"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Buat Invoice Baru</h2>
          <p className="text-sm text-gray-500 mt-0.5">Isi detail invoice untuk customer</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">

        {errorMessage && (
          <div className="mb-5">
            <ErrorMessage message={errorMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit(handleCreate)} noValidate className="space-y-5">

          {/* Customer info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Informasi Customer
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="customer_name"
                label="Nama Customer"
                placeholder="Dindin Mahpudin"
                error={errors.customer_name?.message}
                {...register('customer_name')}
              />
              <Input
                id="customer_email"
                type="email"
                label="Email Customer"
                placeholder="budi@example.com"
                error={errors.customer_email?.message}
                {...register('customer_email')}
              />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Invoice detail */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Detail Invoice
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Jumlah (IDR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      Rp
                    </span>
                    <input
                      id="amount"
                      type="number"
                      min={1}
                      placeholder="0"
                      className={`
                        w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-colors duration-150
                        ${errors.amount
                          ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }
                      `}
                      {...register('amount', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Due date */}
                <Input
                  id="due_date"
                  type="date"
                  label="Due Date"
                  min={today}
                  error={errors.due_date?.message}
                  {...register('due_date')}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Deskripsi invoice atau produk/jasa yang dibeli..."
                  className={`
                    w-full px-4 py-2.5 rounded-lg border text-sm resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors duration-150
                    ${errors.description
                      ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }
                  `}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 pt-5 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Link
              to={ROUTES.MERCHANT_INVOICES}
              className="
                inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium
                border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors
              "
            >
              Batal
            </Link>
            <Button type="submit" isLoading={isLoading}>
              {isLoading ? 'Membuat...' : 'Buat Invoice'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}