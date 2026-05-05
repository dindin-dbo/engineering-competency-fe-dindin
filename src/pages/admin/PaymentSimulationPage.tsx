import { useState } from 'react'
import { usePaymentSimulation } from '@/hooks/admin/usePaymentSimulation'
import { PaymentIntent } from '@/types'
import Badge from '@/components/ui/Badge'
import ConfirmModal from '@/components/ui/ConfirmModal'
import IconButton from '@/components/ui/IconButton'
import Table from '@/components/ui/Table'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'

const METHOD_LABELS: Record<string, string> = {
  WALLET: 'Wallet',
  VA_DUMMY: 'Virtual Account',
  EWALLET_DUMMY: 'E-Wallet',
}

interface PendingAction {
  intent: PaymentIntent
  status: 'SUCCESS' | 'FAILED'
}

const CheckIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function PaymentSimulationPage() {
  const {
    intents,
    isLoading,
    processingId,
    error,
    search,
    setSearch,
    handleUpdateStatus,
  } = usePaymentSimulation()

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const handleConfirm = async () => {
    if (!pendingAction) return
    await handleUpdateStatus(pendingAction.intent.id, pendingAction.status)
    setPendingAction(null)
  }

  return (
    <div className="space-y-5">

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Payment Simulation</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Simulasi status pembayaran dari customer
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari invoice atau merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari payment intent"
            className="
              w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
            "
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Memuat payment intents..." />
        ) : intents.length === 0 ? (
          <EmptyState
            message="Tidak ada payment intent"
            description={search ? 'Coba kata kunci lain' : 'Belum ada pembayaran yang diproses'}
          />
        ) : (
          <>
            <Table
              data={intents}
              keyExtractor={(intent) => intent.id}
              columns={[
                {
                  header: 'No. Invoice',
                  render: (intent) => (
                    <span className="font-mono text-xs text-violet-600">
                      {intent.invoice_number}
                    </span>
                  ),
                },
                {
                  header: 'Merchant',
                  render: (intent) => (
                    <span className="font-medium text-gray-700">{intent.merchant_name}</span>
                  ),
                },
                {
                  header: 'Metode',
                  render: (intent) => (
                    <span className="text-gray-500 text-xs">
                      {METHOD_LABELS[intent.method] ?? intent.method}
                    </span>
                  ),
                },
                {
                  header: 'Tanggal',
                  render: (intent) => (
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(intent.created_at)}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  render: (intent) => (
                    <Badge
                      label={getStatusLabel(intent.status)}
                      variant={getStatusVariant(intent.status)}
                    />
                  ),
                },
                {
                  header: 'Aksi',
                  align: 'center',
                  render: (intent) =>
                    intent.status === 'PENDING' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <IconButton
                          icon={CheckIcon}
                          tooltip="Approve"
                          variant="success"
                          onClick={() => setPendingAction({ intent, status: 'SUCCESS' })}
                          aria-label={`Approve ${intent.invoice_number}`}
                        />
                        <IconButton
                          icon={XIcon}
                          tooltip="Reject"
                          variant="danger"
                          onClick={() => setPendingAction({ intent, status: 'FAILED' })}
                          aria-label={`Reject ${intent.invoice_number}`}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    ),
                },
              ]}
              mobileCard={(intent) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-violet-600">{intent.invoice_number}</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{intent.merchant_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {METHOD_LABELS[intent.method]} · {formatDate(intent.created_at)}
                      </p>
                    </div>
                    <Badge
                      label={getStatusLabel(intent.status)}
                      variant={getStatusVariant(intent.status)}
                    />
                  </div>
                  {intent.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1">
                      <IconButton
                        icon={CheckIcon}
                        tooltip="Tandai Berhasil"
                        variant="success"
                        size="sm"
                        onClick={() => setPendingAction({ intent, status: 'SUCCESS' })}
                        aria-label={`Approve ${intent.invoice_number}`}
                      />
                      <IconButton
                        icon={XIcon}
                        tooltip="Tandai Gagal"
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingAction({ intent, status: 'FAILED' })}
                        aria-label={`Reject ${intent.invoice_number}`}
                      />
                    </div>
                  )}
                </div>
              )}
            />
          </>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirm}
        isLoading={!!processingId}
        title={pendingAction?.status === 'SUCCESS'
          ? 'Konfirmasi Pembayaran Berhasil'
          : 'Konfirmasi Pembayaran Gagal'
        }
        description={pendingAction
          ? `Apakah kamu yakin ingin mengubah status payment intent ${pendingAction.intent.invoice_number} menjadi ${pendingAction.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED'}? ${pendingAction.status === 'SUCCESS' ? 'Invoice akan otomatis berubah menjadi PAID.' : ''}`
          : ''
        }
        confirmLabel={pendingAction?.status === 'SUCCESS' ? 'Ya, Tandai Berhasil' : 'Ya, Tandai Gagal'}
        variant={pendingAction?.status === 'SUCCESS' ? 'success' : 'danger'}
      />

    </div>
  )
}