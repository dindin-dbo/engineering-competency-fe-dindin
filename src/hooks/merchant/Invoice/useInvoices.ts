/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { invoiceApi } from '@/api/invoiceApi'
import { Invoice, InvoiceStatus, PaginationMeta } from '@/types'

interface UseInvoicesParams {
  page?: number
  limit?: number
  status?: InvoiceStatus | ''
}

interface UseInvoicesReturn {
  invoices: Invoice[]
  meta: PaginationMeta | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useInvoices({
  page = 1,
  limit = 20,
  status = '',
}: UseInvoicesParams = {}): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = {
        page,
        limit,
        ...(status ? { status } : {}),
      }
      const res = await invoiceApi.getInvoices(params)
      setInvoices(res.data.data)
      setMeta(res.data.meta ?? null)
    } catch {
      setError('Gagal memuat daftar invoice.')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return { invoices, meta, isLoading, error, refetch: fetchInvoices }
}