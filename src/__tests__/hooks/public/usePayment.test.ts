import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/api/paymentApi', () => ({
  paymentApi: {
    getInvoiceByToken: vi.fn(),
    createPaymentIntent: vi.fn(),
    getPaymentIntent: vi.fn(),
  },
}))

import { paymentApi } from '@/api/paymentApi'
import { usePayment } from '@/hooks/public/usePayment'

const mockPaymentApi = vi.mocked(paymentApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockInvoice = {
  id: 'inv-1',
  merchant_id: 'u1',
  invoice_number: 'INV-001',
  customer_name: 'Andi',
  customer_email: 'andi@test.com',
  amount: 150000,
  description: 'Test',
  due_date: '2025-05-01',
  status: 'PENDING' as const,
  payment_link_token: 'tok-abc',
  created_at: '2025-04-01T00:00:00Z',
}

const mockIntent = {
  id: 'pi-1',
  invoice_id: 'inv-1',
  invoice_number: 'INV-001',
  merchant_name: 'Budi',
  method: 'WALLET' as const,
  status: 'PENDING' as const,
  created_at: '2025-04-01T09:00:00Z',
}

// Helper flush semua microtask/promise yang pending
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('usePayment — tanpa polling', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoadingInvoice true', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))
    expect(result.current.isLoadingInvoice).toBe(true)

    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))
  })

  it('loads invoice by token', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    expect(result.current.invoice).toEqual(mockInvoice)
    expect(result.current.error).toBeNull()
  })

  it('sets error when token is invalid', async () => {
    mockPaymentApi.getInvoiceByToken.mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => usePayment('invalid-token'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    expect(result.current.error).toBe('Link pembayaran tidak valid atau sudah kedaluwarsa.')
    expect(result.current.invoice).toBeNull()
  })

  it('does not fetch when token is empty', () => {
    renderHook(() => usePayment(''))
    expect(mockPaymentApi.getInvoiceByToken).not.toHaveBeenCalled()
  })

  it('sets selectedMethod when setSelectedMethod called', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    act(() => { result.current.setSelectedMethod('WALLET') })
    expect(result.current.selectedMethod).toBe('WALLET')
  })

  it('creates payment intent on handlePay', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )
    mockPaymentApi.createPaymentIntent.mockResolvedValue(
      mockAxios({ data: mockIntent })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    act(() => { result.current.setSelectedMethod('WALLET') })
    await act(async () => { await result.current.handlePay() })

    expect(mockPaymentApi.createPaymentIntent).toHaveBeenCalledWith('tok-abc', 'WALLET')
    expect(result.current.paymentIntent).toEqual(mockIntent)
  })

  it('does not call createPaymentIntent when no method selected', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    await act(async () => { await result.current.handlePay() })

    expect(mockPaymentApi.createPaymentIntent).not.toHaveBeenCalled()
  })

  it('sets error when createPaymentIntent fails', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )
    mockPaymentApi.createPaymentIntent.mockRejectedValue({
      response: { data: { error: { message: 'Payment failed' } } },
    })

    const { result } = renderHook(() => usePayment('tok-abc'))
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    act(() => { result.current.setSelectedMethod('WALLET') })
    await act(async () => { await result.current.handlePay() })

    await waitFor(() => {
      expect(result.current.error).toBe('Payment failed')
    })
  })
})

describe('usePayment — dengan polling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls payment intent and updates status to SUCCESS', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )
    mockPaymentApi.createPaymentIntent.mockResolvedValue(
      mockAxios({ data: mockIntent })
    )
    mockPaymentApi.getPaymentIntent.mockResolvedValue(
      mockAxios({ data: { ...mockIntent, status: 'SUCCESS' } })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))

    // Tunggu invoice load — flush microtasks dulu
    await act(async () => { await flushPromises() })
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    act(() => { result.current.setSelectedMethod('WALLET') })
    await act(async () => { await result.current.handlePay() })

    // Advance timer supaya polling terpicu
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await flushPromises()
    })

    await waitFor(() => {
      expect(result.current.paymentIntent?.status).toBe('SUCCESS')
      expect(result.current.invoice?.status).toBe('PAID')
    })
  })

  it('stops polling when payment intent status is FAILED', async () => {
    mockPaymentApi.getInvoiceByToken.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )
    mockPaymentApi.createPaymentIntent.mockResolvedValue(
      mockAxios({ data: mockIntent })
    )
    mockPaymentApi.getPaymentIntent.mockResolvedValue(
      mockAxios({ data: { ...mockIntent, status: 'FAILED' } })
    )

    const { result } = renderHook(() => usePayment('tok-abc'))

    await act(async () => { await flushPromises() })
    await waitFor(() => expect(result.current.isLoadingInvoice).toBe(false))

    act(() => { result.current.setSelectedMethod('WALLET') })
    await act(async () => { await result.current.handlePay() })

    // Trigger polling pertama
    await act(async () => {
      vi.advanceTimersByTime(3000)
      await flushPromises()
    })

    await waitFor(() => {
      expect(result.current.paymentIntent?.status).toBe('FAILED')
    })

    const callCount = mockPaymentApi.getPaymentIntent.mock.calls.length

    // Advance lagi — polling seharusnya sudah berhenti
    await act(async () => {
      vi.advanceTimersByTime(6000)
      await flushPromises()
    })

    expect(mockPaymentApi.getPaymentIntent.mock.calls.length).toBe(callCount)
  })
})