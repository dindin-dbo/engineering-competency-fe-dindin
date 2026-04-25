import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/walletApi', () => ({
  walletApi: {
    getWallet: vi.fn(),
    getTopupHistory: vi.fn(),
    requestTopup: vi.fn(),
  },
}))

import { walletApi } from '@/api/walletApi'
import { useWallet } from '@/hooks/merchant/Wallet/useWallet'

const mockWalletApi = vi.mocked(walletApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockWallet = { id: 'w1', merchant_id: 'u1', balance: 500000 }
const mockTopups = [
  {
    id: 'topup-1',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 100000,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
]

describe('useWallet', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))

    const { result } = renderHook(() => useWallet())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads wallet and topup history', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.wallet).toEqual(mockWallet)
    expect(result.current.topupHistory).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockWalletApi.getWallet.mockRejectedValue(new Error('Network error'))
    mockWalletApi.getTopupHistory.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat data wallet.')
  })

  it('handles topup successfully', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))
    mockWalletApi.requestTopup.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleTopup(100000) })

    await waitFor(() => {
      expect(result.current.topupSuccess).toBe(true)
      expect(result.current.topupError).toBeNull()
    })

    expect(mockWalletApi.requestTopup).toHaveBeenCalledWith(100000)
  })

  it('sets topupError when topup fails', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))
    mockWalletApi.requestTopup.mockRejectedValue({
      response: { data: { error: { message: 'Top-up gagal' } } },
    })

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleTopup(100000) })

    await waitFor(() => {
      expect(result.current.topupError).toBe('Top-up gagal')
      expect(result.current.topupSuccess).toBe(false)
    })
  })

  it('sets fallback topupError when no API message', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))
    mockWalletApi.requestTopup.mockRejectedValue({})

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleTopup(100000) })

    await waitFor(() => {
      expect(result.current.topupError).toBe('Gagal mengajukan top-up.')
    })
  })

  it('sets isSubmitting true while topup in progress', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))
    mockWalletApi.requestTopup.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => { result.current.handleTopup(100000) })
    expect(result.current.isSubmitting).toBe(true)
  })

  it('refetches data after successful topup', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockWalletApi.getTopupHistory.mockResolvedValue(mockAxios({ data: mockTopups }))
    mockWalletApi.requestTopup.mockResolvedValue(mockAxios({ data: {} }))

    const { result } = renderHook(() => useWallet())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.handleTopup(100000) })

    // getWallet dipanggil 2x — initial load + setelah topup
    expect(mockWalletApi.getWallet.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})