import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/merchant/Dashboard/useDashboard'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'
import { ROUTES } from '@/constants/routes'

export default function MerchantDashboardPage() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <LoadingSpinner message="Memuat dashboard..." />

  if (error) return (
    <div className="max-w-md">
      <ErrorMessage message={error} />
    </div>
  )

  const { wallet, recentInvoices, totalPaid, totalPending, totalExpired, totalRevenue } = data

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Saldo Wallet"
          value={formatCurrency(wallet?.balance ?? 0)}
          iconBg="bg-blue-50"
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          iconBg="bg-green-50"
          sub={`${totalPaid} invoice lunas`}
          icon={
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Invoice Pending"
          value={totalPending}
          iconBg="bg-amber-50"
          sub="Menunggu pembayaran"
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Invoice Expired"
          value={totalExpired}
          iconBg="bg-red-50"
          sub="Melewati due date"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Invoice Terbaru</h2>
          <Link
            to={ROUTES.MERCHANT_INVOICES}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Lihat semua
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <EmptyState
            message="Belum ada invoice"
            description="Buat invoice pertama kamu"
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
            {/* Table desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">No. Invoice</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.MERCHANT_INVOICE_DETAIL.replace(':id', inv.id)}
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-800 font-medium">{inv.customer_name}</p>
                        <p className="text-xs text-gray-400">{inv.customer_email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          label={getStatusLabel(inv.status)}
                          variant={getStatusVariant(inv.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={ROUTES.MERCHANT_INVOICE_DETAIL.replace(':id', inv.id)}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-blue-600">{inv.invoice_number}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{inv.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(inv.due_date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-gray-800">{formatCurrency(inv.amount)}</span>
                    <Badge
                      label={getStatusLabel(inv.status)}
                      variant={getStatusVariant(inv.status)}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to={ROUTES.MERCHANT_INVOICE_CREATE}
          className="
            flex items-center gap-4 bg-white rounded-xl border border-gray-200
            px-5 py-4 hover:border-blue-300 hover:bg-blue-50/50
            transition-colors group
          "
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Buat Invoice</p>
            <p className="text-xs text-gray-400 mt-0.5">Buat invoice baru untuk customer</p>
          </div>
        </Link>

        <Link
          to={ROUTES.MERCHANT_WALLET}
          className="
            flex items-center gap-4 bg-white rounded-xl border border-gray-200
            px-5 py-4 hover:border-green-300 hover:bg-green-50/50
            transition-colors group
          "
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Top Up Wallet</p>
            <p className="text-xs text-gray-400 mt-0.5">Tambah saldo wallet merchant</p>
          </div>
        </Link>
      </div>

    </div>
  )
}