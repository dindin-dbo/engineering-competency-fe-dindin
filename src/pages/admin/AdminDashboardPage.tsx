import { useAdminStats } from '@/hooks/admin/useAdminStats'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { formatCurrency } from '@/utils/formatCurrency'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function AdminDashboardPage() {
  const { stats, isLoading, error } = useAdminStats()

  if (isLoading) return <LoadingSpinner message="Memuat statistik..." />
  if (error) return <div className="max-w-md"><ErrorMessage message={error} /></div>

  return (
    <div className="space-y-6">

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Invoice"
          value={stats?.total_invoices ?? 0}
          iconBg="bg-violet-50"
          icon={
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Invoice Lunas"
          value={stats?.total_paid ?? 0}
          iconBg="bg-green-50"
          sub={`${stats?.total_failed ?? 0} gagal, ${stats?.total_expired ?? 0} expired`}
          icon={
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Transaksi"
          value={formatCurrency(stats?.total_transaction_amount ?? 0)}
          iconBg="bg-blue-50"
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Invoice Gagal"
          value={stats?.total_failed ?? 0}
          iconBg="bg-red-50"
          icon={
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Invoice Expired"
          value={stats?.total_expired ?? 0}
          iconBg="bg-amber-50"
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Refund"
          value={formatCurrency(stats?.total_refund_amount ?? 0)}
          iconBg="bg-orange-50"
          icon={
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Payment Simulation',
            desc: 'Approve atau reject payment intent',
            to: ROUTES.ADMIN_PAYMENT_SIMULATION,
            color: 'bg-violet-50 group-hover:bg-violet-100',
            iconColor: 'text-violet-500',
          },
          {
            label: 'Refund Management',
            desc: 'Kelola pengajuan refund merchant',
            to: ROUTES.ADMIN_REFUND_MANAGEMENT,
            color: 'bg-blue-50 group-hover:bg-blue-100',
            iconColor: 'text-blue-500',
          },
          {
            label: 'Top-up Approval',
            desc: 'Setujui atau tolak top-up wallet',
            to: ROUTES.ADMIN_TOPUP_APPROVAL,
            color: 'bg-green-50 group-hover:bg-green-100',
            iconColor: 'text-green-500',
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="
              flex items-center gap-4 bg-white rounded-xl border border-gray-200
              px-5 py-4 hover:border-gray-300 transition-colors group
            "
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              transition-colors ${item.color}
            `}>
              <svg className={`w-5 h-5 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}