import { useState } from 'react'
import { useAdminRefund } from '@/hooks/admin/useAdminRefund'
import { Refund } from '@/types'
import Badge from '@/components/ui/Badge'
import ConfirmModal from '@/components/ui/ConfirmModal'
import IconButton from '@/components/ui/IconButton'
import Table from '@/components/ui/Table'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'

type DecisionStatus = 'APPROVED' | 'REJECTED'
type ProcessStatus = 'SUCCESS' | 'FAILED'

interface PendingDecision {
  refund: Refund
  type: 'decision'
  status: DecisionStatus
}

interface PendingProcess {
  refund: Refund
  type: 'process'
  status: ProcessStatus
}

type PendingAction = PendingDecision | PendingProcess

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

const PlayIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

function ActionButtons({
  refund,
  onDecision,
  onProcess,
}: {
  refund: Refund
  onDecision: (refund: Refund, status: DecisionStatus) => void
  onProcess: (refund: Refund, status: ProcessStatus) => void
}) {
  if (refund.status === 'REQUESTED') {
    return (
      <div className="flex items-center gap-1.5">
        <IconButton
          icon={CheckIcon}
          tooltip="Approve Refund"
          variant="success"
          onClick={() => onDecision(refund, 'APPROVED')}
          aria-label={`Approve refund ${refund.invoice_number}`}
        />
        <IconButton
          icon={XIcon}
          tooltip="Reject Refund"
          variant="danger"
          onClick={() => onDecision(refund, 'REJECTED')}
          aria-label={`Reject refund ${refund.invoice_number}`}
        />
      </div>
    )
  }

  if (refund.status === 'APPROVED') {
    return (
      <div className="flex items-center gap-1.5">
        <IconButton
          icon={PlayIcon}
          tooltip="Proses Berhasil"
          variant="info"
          onClick={() => onProcess(refund, 'SUCCESS')}
          aria-label={`Process success refund ${refund.invoice_number}`}
        />
        <IconButton
          icon={XIcon}
          tooltip="Proses Gagal"
          variant="danger"
          onClick={() => onProcess(refund, 'FAILED')}
          aria-label={`Process failed refund ${refund.invoice_number}`}
        />
      </div>
    )
  }

  return <span className="text-xs text-gray-400">—</span>
}

function getModalConfig(action: PendingAction | null) {
  if (!action) return { title: '', description: '', confirmLabel: '', variant: 'info' as const }

  const inv = action.refund.invoice_number
  const amt = action.refund.amount

  if (action.type === 'decision') {
    if (action.status === 'APPROVED') {
      return {
        title: 'Approve Refund',
        description: `Setujui pengajuan refund ${inv} sebesar ${amt.toLocaleString('id-ID')}? Refund akan masuk ke tahap proses.`,
        confirmLabel: 'Ya, Approve',
        variant: 'success' as const,
      }
    }
    return {
      title: 'Reject Refund',
      description: `Tolak pengajuan refund ${inv}? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Reject',
      variant: 'danger' as const,
    }
  }

  if (action.status === 'SUCCESS') {
    return {
      title: 'Proses Refund Berhasil',
      description: `Tandai refund ${inv} sebagai SUCCESS? Saldo merchant akan berkurang sebesar ${amt.toLocaleString('id-ID')}.`,
      confirmLabel: 'Ya, Proses',
      variant: 'success' as const,
    }
  }

  return {
    title: 'Proses Refund Gagal',
    description: `Tandai refund ${inv} sebagai FAILED? Saldo merchant tidak akan berubah.`,
    confirmLabel: 'Ya, Tandai Gagal',
    variant: 'danger' as const,
  }
}

export default function RefundManagementPage() {
  const { refunds, isLoading, processingId, error, handleDecision, handleProcess } =
    useAdminRefund()

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const handleConfirm = async () => {
    if (!pendingAction) return

    if (pendingAction.type === 'decision') {
      await handleDecision(pendingAction.refund.id, pendingAction.status)
    } else {
      await handleProcess(pendingAction.refund.id, pendingAction.status)
    }

    setPendingAction(null)
  }

  const modalConfig = getModalConfig(pendingAction)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Refund Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Kelola pengajuan refund dari merchant
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Memuat data refund..." />
        ) : refunds.length === 0 ? (
          <EmptyState
            message="Tidak ada pengajuan refund"
            description="Belum ada merchant yang mengajukan refund"
          />
        ) : (
          <>
            <Table
              data={refunds}
              keyExtractor={(refund) => refund.id}
              columns={[
                {
                  header: 'No. Invoice',
                  render: (refund) => (
                    <span className="font-mono text-xs text-blue-600">
                      {refund.invoice_number}
                    </span>
                  ),
                },
                {
                  header: 'Merchant',
                  render: (refund) => (
                    <span className="font-medium text-gray-700">{refund.merchant_name}</span>
                  ),
                },
                {
                  header: 'Jumlah',
                  render: (refund) => (
                    <span className="font-medium text-gray-800 whitespace-nowrap">
                      {formatCurrency(refund.amount)}
                    </span>
                  ),
                },
                {
                  header: 'Alasan',
                  render: (refund) => (
                    <p className="truncate text-xs text-gray-500 max-w-xs">{refund.reason}</p>
                  ),
                },
                {
                  header: 'Tanggal',
                  render: (refund) => (
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(refund.created_at)}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  render: (refund) => (
                    <Badge
                      label={getStatusLabel(refund.status)}
                      variant={getStatusVariant(refund.status)}
                    />
                  ),
                },
                {
                  header: 'Aksi',
                  align: 'center',
                  render: (refund) => (
                    <div className="flex justify-center">
                      <ActionButtons
                        refund={refund}
                        onDecision={(r, s) => setPendingAction({ refund: r, type: 'decision', status: s })}
                        onProcess={(r, s) => setPendingAction({ refund: r, type: 'process', status: s })}
                      />
                    </div>
                  ),
                },
              ]}
              mobileCard={(refund) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-blue-600">{refund.invoice_number}</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{refund.merchant_name}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatCurrency(refund.amount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{refund.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(refund.created_at)}</p>
                    </div>
                    <Badge
                      label={getStatusLabel(refund.status)}
                      variant={getStatusVariant(refund.status)}
                    />
                  </div>
                  <ActionButtons
                    refund={refund}
                    onDecision={(r, s) => setPendingAction({ refund: r, type: 'decision', status: s })}
                    onProcess={(r, s) => setPendingAction({ refund: r, type: 'process', status: s })}
                  />
                </div>
              )}
            />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirm}
        isLoading={!!processingId}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        variant={modalConfig.variant}
      />
    </div>
  )
}