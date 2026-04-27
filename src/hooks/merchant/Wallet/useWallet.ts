/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import { walletApi } from '@/api/walletApi'
import { Wallet, TopupRequest } from '@/types'

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [topupHistory, setTopupHistory] = useState<TopupRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topupError, setTopupError] = useState<string | null>(null)
  const [topupSuccess, setTopupSuccess] = useState(false)

  const fetchWallet = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [walletRes, historyRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTopupHistory(),
      ])
      setWallet(walletRes.data.data)
      setTopupHistory(
        [...historyRes.data.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
    } catch {
      setError('Gagal memuat data wallet.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  const handleTopup = async (amount: number) => {
    setIsSubmitting(true)
    setTopupError(null)
    setTopupSuccess(false)

    try {
      await walletApi.requestTopup(amount)
      setTopupSuccess(true)
      await fetchWallet()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setTopupError(
        e.response?.data?.error?.message ?? 'Gagal mengajukan top-up.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    wallet,
    topupHistory,
    isLoading,
    isSubmitting,
    error,
    topupError,
    topupSuccess,
    handleTopup,
    refetch: fetchWallet,
  }
}