/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/api/adminApi'
import { PaymentIntent } from '@/types'

export function usePaymentSimulation() {
  const [intents, setIntents] = useState<PaymentIntent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchIntents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await adminApi.getPaymentIntents()
      setIntents(res.data.data as unknown as PaymentIntent[])
    } catch {
      setError('Gagal memuat payment intents.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIntents()
  }, [fetchIntents])

  const handleUpdateStatus = async (id: string, status: 'SUCCESS' | 'FAILED') => {
    setProcessingId(id)
    try {
      await adminApi.updatePaymentIntentStatus(id, status)
      await fetchIntents()
    } catch {
      setError('Gagal mengubah status payment.')
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = search.trim()
    ? intents.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
          i.merchant_name.toLowerCase().includes(search.toLowerCase())
      )
    : intents

  return {
    intents: filtered,
    isLoading,
    processingId,
    error,
    search,
    setSearch,
    handleUpdateStatus,
    refetch: fetchIntents,
  }
}