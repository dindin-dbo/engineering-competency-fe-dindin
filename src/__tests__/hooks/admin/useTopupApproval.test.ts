import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    getBalanceRequests: vi.fn(),
    updateBalanceRequestStatus: vi.fn(),
  },
}))

import { adminApi } from '@/api/adminApi'
import { useTopupApproval } from '@/hooks/admin/useTopupApproval'

const mockAdminApi = vi.mocked(adminApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockRequests = [
  {
    id: 'topup-1',
    merchant_id: 'u1',
    merchant_name: 'Dindin Merchant',
    amount: 200000,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'topup-2',
    merchant_id: 'u2',
    merchant_name: 'Siti Merchant',
    amount: 500000,
    status: 'SUCCESS' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
]

describe('useTopupApproval', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))

    const { result } = renderHook(() => useTopupApproval())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads requests successfully', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.requests).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockAdminApi.getBalanceRequests.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat balance requests.')
  })

  it('updates status to SUCCESS', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('topup-1', 'SUCCESS')
    })

    expect(mockAdminApi.updateBalanceRequestStatus).toHaveBeenCalledWith('topup-1', 'SUCCESS')
  })

  it('updates status to FAILED', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('topup-1', 'FAILED')
    })

    expect(mockAdminApi.updateBalanceRequestStatus).toHaveBeenCalledWith('topup-1', 'FAILED')
  })

  it('sets processingId while updating', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.handleUpdateStatus('topup-1', 'SUCCESS') })
    expect(result.current.processingId).toBe('topup-1')
  })

  it('clears processingId after update', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('topup-1', 'SUCCESS')
    })

    expect(result.current.processingId).toBeNull()
  })

  it('sets error when update fails', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('topup-1', 'SUCCESS')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Gagal mengubah status top-up.')
    })
  })

  it('refetches after successful update', async () => {
    mockAdminApi.getBalanceRequests.mockResolvedValue(mockAxios({ data: mockRequests }))
    mockAdminApi.updateBalanceRequestStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useTopupApproval())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('topup-1', 'SUCCESS')
    })

    expect(mockAdminApi.getBalanceRequests.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})