import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    getPaymentIntents: vi.fn(),
    updatePaymentIntentStatus: vi.fn(),
  },
}))

import { adminApi } from '@/api/adminApi'
import { usePaymentSimulation } from '@/hooks/admin/usePaymentSimulation'

const mockAdminApi = vi.mocked(adminApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockIntents = [
  {
    id: 'pi-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_name: 'Dindin Merchant',
    method: 'WALLET' as const,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'pi-2',
    invoice_id: 'inv-2',
    invoice_number: 'INV-002',
    merchant_name: 'Siti Merchant',
    method: 'VA_DUMMY' as const,
    status: 'SUCCESS' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
]

describe('usePaymentSimulation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))

    const { result } = renderHook(() => usePaymentSimulation())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads payment intents successfully', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.intents).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockAdminApi.getPaymentIntents.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat payment intents.')
  })

  it('filters intents by search invoice number', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.setSearch('INV-001') })
    expect(result.current.intents).toHaveLength(1)
    expect(result.current.intents[0].invoice_number).toBe('INV-001')
  })

  it('filters intents by merchant name', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.setSearch('Siti') })
    expect(result.current.intents).toHaveLength(1)
    expect(result.current.intents[0].merchant_name).toBe('Siti Merchant')
  })

  it('returns all intents when search is empty', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.setSearch('') })
    expect(result.current.intents).toHaveLength(2)
  })

  it('updates payment intent status successfully', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))
    mockAdminApi.updatePaymentIntentStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('pi-1', 'SUCCESS')
    })

    expect(mockAdminApi.updatePaymentIntentStatus).toHaveBeenCalledWith('pi-1', 'SUCCESS')
  })

  it('sets processingId while updating', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))
    mockAdminApi.updatePaymentIntentStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.handleUpdateStatus('pi-1', 'SUCCESS') })
    expect(result.current.processingId).toBe('pi-1')
  })

  it('clears processingId after update', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))
    mockAdminApi.updatePaymentIntentStatus.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('pi-1', 'SUCCESS')
    })

    expect(result.current.processingId).toBeNull()
  })

  it('sets error when update fails', async () => {
    mockAdminApi.getPaymentIntents.mockResolvedValue(mockAxios({ data: mockIntents }))
    mockAdminApi.updatePaymentIntentStatus.mockRejectedValue(new Error('Failed'))

    const { result } = renderHook(() => usePaymentSimulation())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleUpdateStatus('pi-1', 'SUCCESS')
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Gagal mengubah status payment.')
    })
  })
})