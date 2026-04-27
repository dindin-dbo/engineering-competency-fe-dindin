import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import { AdminStats } from '@/types'

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await adminApi.getStats()
        setStats(res.data.data)
      } catch {
        setError('Gagal memuat statistik.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { stats, isLoading, error }
}