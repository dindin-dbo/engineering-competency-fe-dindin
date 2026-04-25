import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/invoiceApi', () => ({
  invoiceApi: { getInvoices: vi.fn() },
}))

vi.mock('@/api/refundApi', () => ({
  refundApi: { getRefunds: vi.fn() },
}))

vi.mock('@/api/walletApi', () => ({
  walletApi: { getTopupHistory: vi.fn() },
}))

import { invoiceApi } from '@/api/invoiceApi'
import { refundApi } from '@/api/refundApi'
import { walletApi } from '@/api/walletApi'
import { useTransactionHistory } from '@/hooks/merchant/Transaksi/useTransactionHistory'

const mockInvoiceApi = vi.mocked(invoiceApi)
const mockRefundApi = vi.mocked(refundApi)
const mockWalletApi = vi.mocked(walletApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockPaidInvoices = [
  {
    id: 'inv-1',
    merchant_id: 'u1',
    invoice_number: 'INV-001',
    customer_name: 'Andi',
    customer_email: 'andi@test.com',
    amount: 150000,
    description: 'Test',
    due_date: '2025-05-01',
    status: 'PAID' as const,
    payment_link_token: 'tok1',
    created_at: '2025-04-03T00:00:00Z',
  },
]

const mockRefunds = [
  {
    id: 'ref-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 150000,
    reason: 'Produk tidak sesuai',
    status: 'SUCCESS' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
  {
    id: 'ref-2',
    invoice_id: 'inv-2',
    invoice_number: 'INV-002',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 100000,
    reason: 'Dibatalkan',
    status: 'REQUESTED' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
]

const mockTopups = [
  {
    id: 'topup-1',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 200000,
    status: 'SUCCESS' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'topup-2',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 50000,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
]

const setupMocks = () => {
  mockInvoiceApi.getInvoices.mockResolvedValue(
    mockAxios({ data: mockPaidInvoices, meta: {} })
  )
  mockRefundApi.getRefunds.mockResolvedValue(
    mockAxios({ data: mockRefunds })
  )
  mockWalletApi.getTopupHistory.mockResolvedValue(
    mockAxios({ data: mockTopups })
  )
}

describe('useTransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with isLoading true', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads all transactions successfully', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.transactions.length).toBeGreaterThan(0)
  })

  it('maps paid invoices to PAYMENT_IN transactions', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const paymentTx = result.current.transactions.filter(
      (t) => t.type === 'PAYMENT_IN'
    )

    expect(paymentTx).toHaveLength(1)
    expect(paymentTx[0].amount).toBe(150000)
    expect(paymentTx[0].reference).toBe('INV-001')
    expect(paymentTx[0].description).toContain('Andi')
  })

  it('only includes SUCCESS refunds as REFUND_OUT', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const refundTx = result.current.transactions.filter(
      (t) => t.type === 'REFUND_OUT'
    )

    expect(refundTx).toHaveLength(1)
    expect(refundTx[0].amount).toBe(150000)
    expect(refundTx[0].reference).toBe('INV-001')
  })

  it('only includes SUCCESS topups as TOPUP_IN', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const topupTx = result.current.transactions.filter(
      (t) => t.type === 'TOPUP_IN'
    )

    expect(topupTx).toHaveLength(1)
    expect(topupTx[0].amount).toBe(200000)
  })

  it('sorts transactions by date descending', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const dates = result.current.transactions.map((t) => t.date)
    for (let i = 0; i < dates.length - 1; i++) {
      expect(new Date(dates[i]).getTime()).toBeGreaterThanOrEqual(
        new Date(dates[i + 1]).getTime()
      )
    }
  })

  it('generates unique ids per transaction type', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const ids = result.current.transactions.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('sets error when API fails', async () => {
    mockInvoiceApi.getInvoices.mockRejectedValue(new Error('Network error'))
    mockRefundApi.getRefunds.mockRejectedValue(new Error('Network error'))
    mockWalletApi.getTopupHistory.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat riwayat transaksi.')
    expect(result.current.transactions).toHaveLength(0)
  })

  it('refetch reloads data', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.refetch()

    await waitFor(() => {
      expect(mockInvoiceApi.getInvoices.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('passes correct params to getInvoices', async () => {
    setupMocks()

    const { result } = renderHook(() => useTransactionHistory())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockInvoiceApi.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PAID', limit: 100 })
    )
  })
})