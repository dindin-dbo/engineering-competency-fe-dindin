import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/adminApi', () => ({
  adminApi: { getStats: vi.fn() },
}))

import { adminApi } from '@/api/adminApi'
import { useAdminStats } from '@/hooks/admin/useAdminStats'

const mockAdminApi = vi.mocked(adminApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockStats = {
  total_invoices: 10,
  total_paid: 6,
  total_failed: 2,
  total_expired: 2,
  total_transaction_amount: 900000,
  total_refund_amount: 150000,
}

describe('useAdminStats', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockAdminApi.getStats.mockResolvedValue(mockAxios({ data: mockStats }))

    const { result } = renderHook(() => useAdminStats())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads stats successfully', async () => {
    mockAdminApi.getStats.mockResolvedValue(mockAxios({ data: mockStats }))

    const { result } = renderHook(() => useAdminStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockAdminApi.getStats.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAdminStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat statistik.')
    expect(result.current.stats).toBeNull()
  })
})