import { useEffect, useState } from 'react'
import { invoiceApi } from '@/api/invoiceApi'
import { Invoice } from '@/types'

export function useInvoiceDetail(id: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchInvoice = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await invoiceApi.getInvoiceById(id)
        setInvoice(res.data.data)
      } catch {
        setError('Invoice tidak ditemukan.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [id])

  return { invoice, isLoading, error }
}