import { useEffect, useState } from 'react'
import { invoiceApi } from '@/api/invoiceApi'
import { walletApi } from '@/api/walletApi'
import { Invoice, Wallet } from '@/types'

interface DashboardData {
  wallet: Wallet | null
  recentInvoices: Invoice[]
  totalPaid: number
  totalPending: number
  totalExpired: number
  totalRevenue: number
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    wallet: null,
    recentInvoices: [],
    totalPaid: 0,
    totalPending: 0,
    totalExpired: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [walletRes, invoiceRes] = await Promise.all([
          walletApi.getWallet(),
          invoiceApi.getInvoices({ page: 1, limit: 100 }),
        ])

        const wallet = walletRes.data.data
        const allInvoices = invoiceRes.data.data
        const recentInvoices = [...allInvoices]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setData({
          wallet,
          recentInvoices,
          totalPaid: allInvoices.filter((inv: { status: string }) => inv.status === 'PAID').length,
          totalPending: allInvoices.filter((inv: { status: string }) => inv.status === 'PENDING').length,
          totalExpired: allInvoices.filter((inv: { status: string }) => inv.status === 'EXPIRED').length,
          totalRevenue: allInvoices
            .filter((inv: { status: string }) => inv.status === 'PAID')
            .reduce((sum: any, inv: { amount: any }) => sum + inv.amount, 0),
        })
      } catch {
        setError('Gagal memuat data dashboard.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [])

  return { data, isLoading, error }
}