import { useState } from 'react'
import { useTopupApproval } from '@/hooks/admin/useTopupApproval'
import { TopupRequest } from '@/types'
import Badge from '@/components/ui/Badge'
import ConfirmModal from '@/components/ui/ConfirmModal'
import IconButton from '@/components/ui/IconButton'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'

interface PendingAction {
  request: TopupRequest
  status: 'SUCCESS' | 'FAILED'
}

const CheckIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function TopupApprovalPage() {
  const { requests, isLoading, processingId, error, handleUpdateStatus } =
    useTopupApproval()

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const handleConfirm = async () => {
    if (!pendingAction) return
    await handleUpdateStatus(pendingAction.request.id, pendingAction.status)
    setPendingAction(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Top-up Approval</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Setujui atau tolak permintaan top-up wallet merchant
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Memuat balance requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            message="Tidak ada permintaan top-up"
            description="Belum ada merchant yang mengajukan top-up"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Merchant', 'Jumlah', 'Tanggal', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {req.merchant_name}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          label={getStatusLabel(req.status)}
                          variant={getStatusVariant(req.status)}
                        />
                      </td>
                      <td className="px-5 py-3.5 flex justify-center">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <IconButton
                              icon={CheckIcon}
                              tooltip="Approve Top-up"
                              variant="success"
                              onClick={() => setPendingAction({ request: req, status: 'SUCCESS' })}
                              aria-label={`Approve topup ${req.merchant_name}`}
                            />
                            <IconButton
                              icon={XIcon}
                              tooltip="Reject Top-up"
                              variant="danger"
                              onClick={() => setPendingAction({ request: req, status: 'FAILED' })}
                              aria-label={`Reject topup ${req.merchant_name}`}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.merchant_name}</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(req.amount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(req.created_at)}</p>
                    </div>
                    <Badge
                      label={getStatusLabel(req.status)}
                      variant={getStatusVariant(req.status)}
                    />
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1">
                      <IconButton
                        icon={CheckIcon}
                        tooltip="Approve Top-up"
                        variant="success"
                        size="sm"
                        onClick={() => setPendingAction({ request: req, status: 'SUCCESS' })}
                        aria-label={`Approve topup ${req.merchant_name}`}
                      />
                      <IconButton
                        icon={XIcon}
                        tooltip="Reject Top-up"
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingAction({ request: req, status: 'FAILED' })}
                        aria-label={`Reject topup ${req.merchant_name}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirm}
        isLoading={!!processingId}
        title={pendingAction?.status === 'SUCCESS' ? 'Approve Top-up' : 'Reject Top-up'}
        description={pendingAction
          ? `${pendingAction.status === 'SUCCESS'
              ? `Setujui top-up ${formatCurrency(pendingAction.request.amount)} dari ${pendingAction.request.merchant_name}? Saldo merchant akan bertambah.`
              : `Tolak top-up ${formatCurrency(pendingAction.request.amount)} dari ${pendingAction.request.merchant_name}? Saldo tidak akan berubah.`
            }`
          : ''
        }
        confirmLabel={pendingAction?.status === 'SUCCESS' ? 'Ya, Approve' : 'Ya, Reject'}
        variant={pendingAction?.status === 'SUCCESS' ? 'success' : 'danger'}
      />
    </div>
  )
}