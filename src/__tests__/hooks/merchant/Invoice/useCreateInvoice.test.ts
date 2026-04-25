import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/api/invoiceApi', () => ({
  invoiceApi: { createInvoice: vi.fn() },
}))

import { invoiceApi } from '@/api/invoiceApi'
import { useCreateInvoice } from '@/hooks/merchant/Invoice/useCreateInvoice'
import { ROUTES } from '@/constants/routes'

const mockInvoiceApi = vi.mocked(invoiceApi)

const payload = {
  customer_name: 'Andi',
  customer_email: 'andi@test.com',
  amount: 100000,
  description: 'Test invoice',
  due_date: '2025-05-01',
}

describe('useCreateInvoice', () => {
  beforeEach(() => vi.clearAllMocks())

  it('initial state is idle', () => {
    const { result } = renderHook(() => useCreateInvoice())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('navigates to invoice list on success', async () => {
    mockInvoiceApi.createInvoice.mockResolvedValue({ data: { data: {} } } as any)

    const { result } = renderHook(() => useCreateInvoice())
    await act(async () => { await result.current.handleCreate(payload) })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MERCHANT_INVOICES, { replace: true })
    })
  })

  it('sets errorMessage on failure', async () => {
    mockInvoiceApi.createInvoice.mockRejectedValue({
      response: { data: { error: { message: 'Validation error' } } },
    })

    const { result } = renderHook(() => useCreateInvoice())
    await act(async () => { await result.current.handleCreate(payload) })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Validation error')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('sets fallback errorMessage when no API message', async () => {
    mockInvoiceApi.createInvoice.mockRejectedValue({})

    const { result } = renderHook(() => useCreateInvoice())
    await act(async () => { await result.current.handleCreate(payload) })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Gagal membuat invoice, coba lagi.')
    })
  })

  it('sets isLoading true while creating', async () => {
    mockInvoiceApi.createInvoice.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useCreateInvoice())
    act(() => { result.current.handleCreate(payload) })

    expect(result.current.isLoading).toBe(true)
  })
})