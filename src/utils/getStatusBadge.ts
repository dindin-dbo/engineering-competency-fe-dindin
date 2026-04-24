import { BadgeVariant } from '@/components/ui/Badge'
import { InvoiceStatus, PaymentIntentStatus, RefundStatus, TopupStatus } from '@/types'

type AnyStatus = InvoiceStatus | PaymentIntentStatus | RefundStatus | TopupStatus

export function getStatusVariant(status: AnyStatus): BadgeVariant {
  switch (status) {
    case 'PAID':
    case 'SUCCESS':
    case 'APPROVED':
      return 'success'
    case 'PENDING':
    case 'REQUESTED':
      return 'warning'
    case 'FAILED':
    case 'REJECTED':
    case 'EXPIRED':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function getStatusLabel(status: AnyStatus): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PAID: 'Lunas',
    EXPIRED: 'Kedaluwarsa',
    SUCCESS: 'Berhasil',
    FAILED: 'Gagal',
    REQUESTED: 'Diajukan',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  }
  return labels[status] ?? status
}