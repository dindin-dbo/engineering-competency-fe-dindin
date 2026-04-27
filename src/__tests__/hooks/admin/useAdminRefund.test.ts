import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    getRefunds: vi.fn(),
    updateRefundDecision: vi.fn(),
    processRefund: vi.fn(),
  },
}))

import { adminApi } from '@/api/adminApi'
import { useAdminRefund } from '@/hooks/admin/useAdminRefund'

const mockAdminApi = vi.mocked(adminApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockRefunds = [
  {
    id: 'ref-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_id: 'u1',
    merchant_name: 'Dindin',
    amount: 150000,
    reason: 'Produk tidak sesuai',
    status: 'REQUESTED' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'ref-2',
    invoice_id: 'inv-2',
    invoice_number: 'INV-002',
    merchant_id: 'u1',
    merchant_name: 'Dindin',
    amount: 200000,
    reason: 'Dibatalkan',
    status: 'APPROVED' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
]

describe('useAdminRefund', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))

    const { result } = renderHook(() => useAdminRefund())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads refunds successfully', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.refunds).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error when getRefunds fails', async () => {
    mockAdminApi.getRefunds.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat data refund.')
  })

  it('handles decision APPROVED successfully', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.updateRefundDecision.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDecision('ref-1', 'APPROVED')
    })

    expect(mockAdminApi.updateRefundDecision).toHaveBeenCalledWith('ref-1', 'APPROVED')
  })

  it('handles decision REJECTED successfully', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.updateRefundDecision.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDecision('ref-1', 'REJECTED')
    })

    expect(mockAdminApi.updateRefundDecision).toHaveBeenCalledWith('ref-1', 'REJECTED')
  })

  it('handles process SUCCESS successfully', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.processRefund.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleProcess('ref-2', 'SUCCESS')
    })

    expect(mockAdminApi.processRefund).toHaveBeenCalledWith('ref-2', 'SUCCESS')
  })

  it('sets processingId while handling decision', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.updateRefundDecision.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.handleDecision('ref-1', 'APPROVED') })
    expect(result.current.processingId).toBe('ref-1')
  })

  it('clears processingId after decision', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.updateRefundDecision.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDecision('ref-1', 'APPROVED')
    })

    expect(result.current.processingId).toBeNull()
  })

  it('sets error when decision fails', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.updateRefundDecision.mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDecision('ref-1', 'APPROVED')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Gagal mengubah keputusan refund.')
    })
  })

  it('sets error when process fails', async () => {
    mockAdminApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockAdminApi.processRefund.mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => useAdminRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleProcess('ref-2', 'SUCCESS')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Gagal memproses refund.')
    })
  })
})