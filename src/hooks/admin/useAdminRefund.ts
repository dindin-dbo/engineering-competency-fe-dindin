/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/api/adminApi'
import { Refund } from '@/types'

export function useAdminRefund() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await adminApi.getRefunds()
      setRefunds(res.data.data as unknown as Refund[])
    } catch {
      setError('Gagal memuat data refund.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id)
    try {
      await adminApi.updateRefundDecision(id, status)
      await fetchRefunds()
    } catch {
      setError('Gagal mengubah keputusan refund.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleProcess = async (id: string, status: 'SUCCESS' | 'FAILED') => {
    setProcessingId(id)
    try {
      await adminApi.processRefund(id, status)
      await fetchRefunds()
    } catch {
      setError('Gagal memproses refund.')
    } finally {
      setProcessingId(null)
    }
  }

  return {
    refunds,
    isLoading,
    processingId,
    error,
    handleDecision,
    handleProcess,
    refetch: fetchRefunds,
  }
}