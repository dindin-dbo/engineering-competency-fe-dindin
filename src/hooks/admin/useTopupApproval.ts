/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/api/adminApi'
import { TopupRequest } from '@/types'

export function useTopupApproval() {
  const [requests, setRequests] = useState<TopupRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await adminApi.getBalanceRequests()
      setRequests(res.data.data as unknown as TopupRequest[])
    } catch {
      setError('Gagal memuat balance requests.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleUpdateStatus = async (id: string, status: 'SUCCESS' | 'FAILED') => {
    setProcessingId(id)
    try {
      await adminApi.updateBalanceRequestStatus(id, status)
      await fetchRequests()
    } catch {
      setError('Gagal mengubah status top-up.')
    } finally {
      setProcessingId(null)
    }
  }

  return {
    requests,
    isLoading,
    processingId,
    error,
    handleUpdateStatus,
    refetch: fetchRequests,
  }
}