import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceApi } from '@/api/invoiceApi'
import { ROUTES } from '@/constants/routes'

export interface CreateInvoicePayload {
  customer_name: string
  customer_email: string
  amount: number
  description: string
  due_date: string
}

export function useCreateInvoice() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleCreate = async (payload: CreateInvoicePayload) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await invoiceApi.createInvoice(payload)
      navigate(ROUTES.MERCHANT_INVOICES, { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      setErrorMessage(
        error.response?.data?.error?.message ?? 'Gagal membuat invoice, coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { handleCreate, isLoading, errorMessage }
}