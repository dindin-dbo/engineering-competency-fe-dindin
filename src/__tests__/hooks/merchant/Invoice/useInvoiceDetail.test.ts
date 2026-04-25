import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/invoiceApi', () => ({
  invoiceApi: { getInvoiceById: vi.fn() },
}))

import { invoiceApi } from '@/api/invoiceApi'
import { useInvoiceDetail } from '@/hooks/merchant/Invoice/useInvoiceDetail'

const mockInvoiceApi = vi.mocked(invoiceApi)
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

describe('useInvoiceDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockInvoiceApi.getInvoiceById.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )
    const { result } = renderHook(() => useInvoiceDetail('inv-1'))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads invoice successfully', async () => {
    mockInvoiceApi.getInvoiceById.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => useInvoiceDetail('inv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.invoice).toEqual(mockInvoice)
    expect(result.current.error).toBeNull()
  })

  it('sets error when API fails', async () => {
    mockInvoiceApi.getInvoiceById.mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useInvoiceDetail('inv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Invoice tidak ditemukan.')
    expect(result.current.invoice).toBeNull()
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useInvoiceDetail(''))

    expect(mockInvoiceApi.getInvoiceById).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(true)
  })

  it('calls API with correct id', async () => {
    mockInvoiceApi.getInvoiceById.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result } = renderHook(() => useInvoiceDetail('inv-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockInvoiceApi.getInvoiceById).toHaveBeenCalledWith('inv-1')
  })

  it('refetches when id changes', async () => {
    mockInvoiceApi.getInvoiceById.mockResolvedValue(
      mockAxios({ data: mockInvoice })
    )

    const { result, rerender } = renderHook(
      ({ id }) => useInvoiceDetail(id),
      { initialProps: { id: 'inv-1' } }
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ id: 'inv-2' })
    await waitFor(() => expect(mockInvoiceApi.getInvoiceById).toHaveBeenCalledTimes(2))
    expect(mockInvoiceApi.getInvoiceById).toHaveBeenCalledWith('inv-2')
  })
})