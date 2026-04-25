import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import InvoiceListPage from '@/pages/merchant/Invoice/InvoiceListPage'

vi.mock('@/hooks/merchant/Invoice/useInvoices', () => ({
  useInvoices: vi.fn(),
}))

import { useInvoices } from '@/hooks/merchant/Invoice/useInvoices'

const mockUseInvoices = vi.mocked(useInvoices)

const mockMeta = { page: 1, limit: 10, total_items: 2, total_pages: 1 }

const mockInvoices = [
  {
    id: 'inv-1', merchant_id: 'u1', invoice_number: 'INV-001',
    customer_name: 'Andi', customer_email: 'andi@test.com',
    amount: 150000, description: 'Test', due_date: '2025-05-01',
    status: 'PENDING' as const, payment_link_token: 'tok1',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'inv-2', merchant_id: 'u1', invoice_number: 'INV-002',
    customer_name: 'Siti', customer_email: 'siti@test.com',
    amount: 300000, description: 'Test 2', due_date: '2025-05-02',
    status: 'PAID' as const, payment_link_token: 'tok2',
    created_at: '2025-04-02T00:00:00Z',
  },
]

const renderPage = () =>
  render(<MemoryRouter><InvoiceListPage /></MemoryRouter>)

describe('InvoiceListPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading spinner', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: true, error: null, refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Memuat invoice...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false,
      error: 'Gagal memuat daftar invoice.', refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Gagal memuat daftar invoice.')).toBeInTheDocument()
  })

  it('shows empty state when no invoices', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Belum ada invoice')).toBeInTheDocument()
  })

  it('renders invoice list when data loaded', () => {
    mockUseInvoices.mockReturnValue({
      invoices: mockInvoices, meta: mockMeta,
      isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Andi').length).toBeGreaterThan(0)
  })

  it('renders buat invoice button', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()
  
    // Pakai getAllByRole karena ada 2 link "Buat Invoice" — header dan empty state
    const links = screen.getAllByRole('link', { name: /buat invoice/i })
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders filter buttons', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Semua Status')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Lunas')).toBeInTheDocument()
    expect(screen.getByText('Kedaluwarsa')).toBeInTheDocument()
  })

  it('active filter button has blue styling', () => {
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()

    const allBtn = screen.getByText('Semua Status')
    expect(allBtn.className).toContain('bg-blue-600')
  })

  it('clicking filter updates active style', async () => {
    const user = userEvent.setup()
    mockUseInvoices.mockReturnValue({
      invoices: [], meta: null, isLoading: false, error: null, refetch: vi.fn(),
    })
    renderPage()

    await user.click(screen.getByText('Pending'))

    await waitFor(() => {
      expect(screen.getByText('Pending').className).toContain('bg-blue-600')
    })
  })
})