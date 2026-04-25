/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { refundApi, CreateRefundPayload } from '@/api/refundApi'
import { Refund } from '@/types'

export function useRefund() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await refundApi.getRefunds()
      setRefunds(res.data.data as unknown as Refund[])
    } catch {
      setError('Gagal memuat daftar refund.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  const handleCreateRefund = async (payload: CreateRefundPayload) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      await refundApi.createRefund(payload)
      setSubmitSuccess(true)
      await fetchRefunds()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setSubmitError(
        e.response?.data?.error?.message ?? 'Gagal mengajukan refund.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    refunds,
    isLoading,
    isSubmitting,
    error,
    submitError,
    submitSuccess,
    handleCreateRefund,
    refetch: fetchRefunds,
  }
}