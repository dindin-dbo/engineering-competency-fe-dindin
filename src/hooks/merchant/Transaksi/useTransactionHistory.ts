/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { invoiceApi } from '@/api/invoiceApi'
import { walletApi } from '@/api/walletApi'
import { refundApi } from '@/api/refundApi'
import { Invoice, Refund, TopupRequest } from '@/types'

export type TransactionType = 'PAYMENT_IN' | 'REFUND_OUT' | 'TOPUP_IN'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  reference: string
  date: string
  raw: Invoice | Refund | TopupRequest
}

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [invoiceRes, refundRes, topupRes] = await Promise.all([
        invoiceApi.getInvoices({ page: 1, limit: 100, status: 'PAID' }),
        refundApi.getRefunds(),
        walletApi.getTopupHistory(),
      ])

      const paidInvoices = invoiceRes.data.data
      const successRefunds = (refundRes.data.data as unknown as Refund[])
        .filter((r) => r.status === 'SUCCESS')
      const successTopups = (topupRes.data.data as unknown as TopupRequest[])
        .filter((t) => t.status === 'SUCCESS')

      const paymentTx: Transaction[] = paidInvoices.map((inv) => ({
        id: `payment-${inv.id}`,
        type: 'PAYMENT_IN',
        amount: inv.amount,
        description: `Pembayaran dari ${inv.customer_name}`,
        reference: inv.invoice_number,
        date: inv.created_at,
        raw: inv,
      }))

      const refundTx: Transaction[] = successRefunds.map((ref) => ({
        id: `refund-${ref.id}`,
        type: 'REFUND_OUT',
        amount: ref.amount,
        description: `Refund ke ${ref.invoice_number}`,
        reference: ref.invoice_number,
        date: ref.created_at,
        raw: ref,
      }))

      const topupTx: Transaction[] = successTopups.map((top) => ({
        id: `topup-${top.id}`,
        type: 'TOPUP_IN',
        amount: top.amount,
        description: 'Top-up saldo wallet',
        reference: top.id,
        date: top.created_at,
        raw: top,
      }))

      const all = [...paymentTx, ...refundTx, ...topupTx].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setTransactions(all)
    } catch {
      setError('Gagal memuat riwayat transaksi.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { transactions, isLoading, error, refetch: fetchAll }
}