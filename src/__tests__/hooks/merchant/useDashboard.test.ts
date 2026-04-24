import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/invoiceApi', () => ({
  invoiceApi: { getInvoices: vi.fn() },
}))

vi.mock('@/api/walletApi', () => ({
  walletApi: { getWallet: vi.fn() },
}))

import { invoiceApi } from '@/api/invoiceApi'
import { walletApi } from '@/api/walletApi'
import { useDashboard } from '@/hooks/merchant/useDashboard'

const mockInvoiceApi = vi.mocked(invoiceApi)
const mockWalletApi = vi.mocked(walletApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockInvoices = [
  { id: '1', status: 'PAID', amount: 100000, created_at: '2025-04-01T00:00:00Z', customer_name: 'A', customer_email: 'a@test.com', invoice_number: 'INV-001', due_date: '2025-05-01', merchant_id: 'u1', description: '', payment_link_token: 'tok1' },
  { id: '2', status: 'PENDING', amount: 50000, created_at: '2025-04-02T00:00:00Z', customer_name: 'B', customer_email: 'b@test.com', invoice_number: 'INV-002', due_date: '2025-05-02', merchant_id: 'u1', description: '', payment_link_token: 'tok2' },
  { id: '3', status: 'EXPIRED', amount: 75000, created_at: '2025-04-03T00:00:00Z', customer_name: 'C', customer_email: 'c@test.com', invoice_number: 'INV-003', due_date: '2025-03-01', merchant_id: 'u1', description: '', payment_link_token: 'tok3' },
]

const mockWallet = { id: 'w1', merchant_id: 'u1', balance: 500000 }

describe('useDashboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should start with isLoading true', () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockInvoiceApi.getInvoices.mockResolvedValue(mockAxios({ data: mockInvoices, meta: {} }))

    const { result } = renderHook(() => useDashboard())
    expect(result.current.isLoading).toBe(true)
  })

  it('should load and compute dashboard data correctly', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockInvoiceApi.getInvoices.mockResolvedValue(mockAxios({ data: mockInvoices, meta: {} }))

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data.wallet?.balance).toBe(500000)
    expect(result.current.data.totalPaid).toBe(1)
    expect(result.current.data.totalPending).toBe(1)
    expect(result.current.data.totalExpired).toBe(1)
    expect(result.current.data.totalRevenue).toBe(100000)
    expect(result.current.data.recentInvoices).toHaveLength(3)
  })

  it('should sort recent invoices by created_at descending', async () => {
    mockWalletApi.getWallet.mockResolvedValue(mockAxios({ data: mockWallet }))
    mockInvoiceApi.getInvoices.mockResolvedValue(mockAxios({ data: mockInvoices, meta: {} }))

    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const dates = result.current.data.recentInvoices.map(inv => inv.created_at)
    expect(dates[0] > dates[1]).toBe(true)
  })

  it('should set error when API fails', async () => {
    mockWalletApi.getWallet.mockRejectedValue(new Error('Network error'))
    mockInvoiceApi.getInvoices.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDashboard())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat data dashboard.')
  })
})