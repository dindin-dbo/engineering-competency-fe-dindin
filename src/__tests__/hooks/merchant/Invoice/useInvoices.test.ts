import { renderHook, waitFor } from '@testing-library/react'

vi.mock('@/api/invoiceApi', () => ({
  invoiceApi: { getInvoices: vi.fn() },
}))

import { invoiceApi } from '@/api/invoiceApi'
import { useInvoices } from '@/hooks/merchant/Invoice/useInvoices'

const mockInvoiceApi = vi.mocked(invoiceApi)
const mockAxios = <T>(data: T) => ({ data } as any)

const mockInvoices = [
  {
    id: 'inv-1', merchant_id: 'u1', invoice_number: 'INV-001',
    customer_name: 'Andi', customer_email: 'andi@test.com',
    amount: 100000, description: 'Test', due_date: '2025-05-01',
    status: 'PENDING' as const, payment_link_token: 'tok1',
    created_at: '2025-04-01T00:00:00Z',
  },
]

const mockMeta = { page: 1, limit: 10, total_items: 1, total_pages: 1 }

describe('useInvoices', () => {
  beforeEach(() => vi.clearAllMocks())

  it('starts with isLoading true', async () => {
    mockInvoiceApi.getInvoices.mockResolvedValue(
      mockAxios({ data: mockInvoices, meta: mockMeta })
    )
    const { result } = renderHook(() => useInvoices())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('loads invoices successfully', async () => {
    mockInvoiceApi.getInvoices.mockResolvedValue(
      mockAxios({ data: mockInvoices, meta: mockMeta })
    )

    const { result } = renderHook(() => useInvoices())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.invoices).toHaveLength(1)
    expect(result.current.invoices[0].invoice_number).toBe('INV-001')
    expect(result.current.meta).toEqual(mockMeta)
    expect(result.current.error).toBeNull()
  })

  it('sets error on API failure', async () => {
    mockInvoiceApi.getInvoices.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useInvoices())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Gagal memuat daftar invoice.')
    expect(result.current.invoices).toHaveLength(0)
  })

  it('passes status filter to API', async () => {
    mockInvoiceApi.getInvoices.mockResolvedValue(
      mockAxios({ data: [], meta: { ...mockMeta, total_items: 0 } })
    )

    const { result } = renderHook(() => useInvoices({ status: 'PAID' }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockInvoiceApi.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PAID' })
    )
  })

  it('does not pass status param when empty string', async () => {
    mockInvoiceApi.getInvoices.mockResolvedValue(
      mockAxios({ data: mockInvoices, meta: mockMeta })
    )

    const { result } = renderHook(() => useInvoices({ status: '' }))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const calledParams = mockInvoiceApi.getInvoices.mock.calls[0][0]
    expect(calledParams).not.toHaveProperty('status')
  })

  it('refetch reloads data', async () => {
    mockInvoiceApi.getInvoices.mockResolvedValue(
      mockAxios({ data: mockInvoices, meta: mockMeta })
    )

    const { result } = renderHook(() => useInvoices())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    result.current.refetch()
    await waitFor(() => expect(mockInvoiceApi.getInvoices).toHaveBeenCalledTimes(2))
  })
})