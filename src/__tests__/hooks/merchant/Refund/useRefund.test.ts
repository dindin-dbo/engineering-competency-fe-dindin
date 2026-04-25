import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/refundApi', () => ({
  refundApi: {
    getRefunds: vi.fn(),
    createRefund: vi.fn(),
  },
}))

import { refundApi } from '@/api/refundApi'
import { useRefund } from '@/hooks/merchant/Refund/useRefund'

const mockRefundApi = vi.mocked(refundApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockRefunds = [
  {
    id: 'refund-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 150000,
    reason: 'Produk tidak sesuai deskripsi',
    status: 'REQUESTED' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
]

const payload = { invoice_id: 'inv-1', reason: 'Produk tidak sesuai deskripsi' }

describe('useRefund', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))

    const { result } = renderHook(() => useRefund())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads refunds successfully', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.refunds).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error when getRefunds fails', async () => {
    mockRefundApi.getRefunds.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat daftar refund.')
    expect(result.current.refunds).toHaveLength(0)
  })

  it('creates refund successfully', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockRefundApi.createRefund.mockResolvedValue(mockAxios({ data: mockRefunds[0] }))

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleCreateRefund(payload) })

    await waitFor(() => {
      expect(result.current.submitSuccess).toBe(true)
      expect(result.current.submitError).toBeNull()
    })

    expect(mockRefundApi.createRefund).toHaveBeenCalledWith(payload)
  })

  it('sets submitError when createRefund fails', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockRefundApi.createRefund.mockRejectedValue({
      response: { data: { error: { message: 'Invoice tidak valid' } } },
    })

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleCreateRefund(payload) })

    await waitFor(() => {
      expect(result.current.submitError).toBe('Invoice tidak valid')
      expect(result.current.submitSuccess).toBe(false)
    })
  })

  it('sets fallback submitError when no API message', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockRefundApi.createRefund.mockRejectedValue({})

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleCreateRefund(payload) })

    await waitFor(() => {
      expect(result.current.submitError).toBe('Gagal mengajukan refund.')
    })
  })

  it('sets isSubmitting true while creating refund', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockRefundApi.createRefund.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.handleCreateRefund(payload) })
    expect(result.current.isSubmitting).toBe(true)
  })

  it('refetches after successful create', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))
    mockRefundApi.createRefund.mockResolvedValue(mockAxios({ data: mockRefunds[0] }))

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleCreateRefund(payload) })

    expect(mockRefundApi.getRefunds.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('refetch reloads data', async () => {
    mockRefundApi.getRefunds.mockResolvedValue(mockAxios({ data: mockRefunds }))

    const { result } = renderHook(() => useRefund())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.refetch()
    await waitFor(() => {
      expect(mockRefundApi.getRefunds.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })
})