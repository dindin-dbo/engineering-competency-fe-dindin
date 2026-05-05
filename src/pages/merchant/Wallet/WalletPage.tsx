import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { topupSchema, TopupFormValues } from '@/utils/validations/walletSchema'
import { useWallet } from '@/hooks/merchant/Wallet/useWallet'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'
import CurrencyInput from '@/components/ui/CurrencyInput'

export default function WalletPage() {
  const {
    wallet,
    topupHistory,
    isLoading,
    isSubmitting,
    error,
    topupError,
    topupSuccess,
    handleTopup,
  } = useWallet()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopupFormValues>({
    resolver: zodResolver(topupSchema),
    defaultValues: { amount: 0 },
  })

  const onSubmit = async (data: TopupFormValues) => {
    await handleTopup(data.amount)
    reset()
  }

  if (isLoading) return <LoadingSpinner message="Memuat data wallet..." />

  if (error) return (
    <div className="max-w-md">
      <ErrorMessage message={error} />
    </div>
  )

  return (
    <div className="space-y-6 max-w-full">

      {/* Balance card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Saldo Wallet
        </p>
        <p className="text-4xl font-bold mt-1">
          {formatCurrency(wallet?.balance ?? 0)}
        </p>
        <p className="text-xs text-slate-500 mt-3">
          Merchant ID: {wallet?.merchant_id}
        </p>
      </div>

      {/* Top-up form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Ajukan Top-up</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Request saldo akan diproses oleh admin sandbox
          </p>
        </div>

        {topupSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700 font-medium">
              Request top-up berhasil diajukan! Menunggu persetujuan admin.
            </p>
          </div>
        )}

        {topupError && <ErrorMessage message={topupError} />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="amount"
                  label="Jumlah Top-up (IDR)"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.amount?.message}
                  min={10000}
                />
              )}
            />
            <p className="text-xs text-gray-400">
              Min: Rp 10.000 — Maks: Rp 10.000.000
            </p>
          </div>

          {/* Quick amount buttons */}
          <div className="flex flex-wrap gap-2">
            {[50000, 100000, 250000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => reset({ amount: amt })}
                className="
                  px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200
                  text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600
                  transition-colors
                "
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold
              bg-blue-600 text-white hover:bg-blue-700 transition-colors
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
            {isSubmitting ? 'Mengajukan...' : 'Ajukan Top-up'}
          </button>
        </form>
      </div>

      {/* Top-up history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Riwayat Top-up</h3>
        </div>

        {topupHistory.length === 0 ? (
          <EmptyState
            message="Belum ada riwayat top-up"
            description="Ajukan top-up pertama kamu di atas"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {topupHistory.map((topup) => (
              <div key={topup.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency(topup.amount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(topup.created_at)}
                  </p>
                </div>
                <Badge
                  label={getStatusLabel(topup.status)}
                  variant={getStatusVariant(topup.status)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}