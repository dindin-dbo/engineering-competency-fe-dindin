import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import InvoiceDetailPage from '@/pages/merchant/Invoice/InvoiceDetailPage'

vi.mock('@/hooks/merchant/Invoice/useInvoiceDetail', () => ({
  useInvoiceDetail: vi.fn(),
}))

import { useInvoiceDetail } from '@/hooks/merchant/Invoice/useInvoiceDetail'

const mockUseInvoiceDetail = vi.mocked(useInvoiceDetail)

const baseInvoice = {
  id: 'inv-1',
  merchant_id: 'u1',
  invoice_number: 'INV-001',
  customer_name: 'Andi',
  customer_email: 'andi@test.com',
  amount: 150000,
  description: 'Pembelian produk A',
  due_date: '2025-05-01',
  status: 'PENDING' as const,
  payment_link_token: 'tok-abc',
  created_at: '2025-04-01T00:00:00Z',
}

const renderPage = (id = 'inv-1') =>
  render(
    <MemoryRouter initialEntries={[`/merchant/invoices/${id}`]}>
      <Routes>
        <Route path="/merchant/invoices/:id" element={<InvoiceDetailPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('InvoiceDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading spinner', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: null, isLoading: true, error: null,
    })
    renderPage()
    expect(screen.getByText('Memuat detail invoice...')).toBeInTheDocument()
  })

  it('shows error message when error', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: null, isLoading: false, error: 'Invoice tidak ditemukan.',
    })
    renderPage()
    expect(screen.getByText('Invoice tidak ditemukan.')).toBeInTheDocument()
  })

  it('renders invoice number and amount', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0)
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument()
  })

  it('renders customer info', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Andi')).toBeInTheDocument()
    expect(screen.getByText('andi@test.com')).toBeInTheDocument()
  })

  it('renders description', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Pembelian produk A')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows payment link section when status is PENDING', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Payment Link')).toBeInTheDocument()
    expect(screen.getByTestId('payment-url')).toBeInTheDocument()
  })

  it('does not show payment link when status is PAID', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: { ...baseInvoice, status: 'PAID' },
      isLoading: false, error: null,
    })
    renderPage()
    expect(screen.queryByText('Payment Link')).not.toBeInTheDocument()
  })

  it('shows paid info banner when status is PAID', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: { ...baseInvoice, status: 'PAID' },
      isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Invoice Sudah Lunas')).toBeInTheDocument()
  })

  it('shows expired info banner when status is EXPIRED', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: { ...baseInvoice, status: 'EXPIRED' },
      isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByText('Invoice Kedaluwarsa')).toBeInTheDocument()
  })

  it('copies payment link when salin button clicked', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, 
      isLoading: false, 
      error: null,
    })
    
    renderPage()

    const copyButtons = screen.getAllByRole('button', { name: /salin payment link/i })
    await user.click(copyButtons[0])

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getAllByText('Tersalin!')[0]).toBeInTheDocument()
    })
  })

  it('renders back link', () => {
    mockUseInvoiceDetail.mockReturnValue({
      invoice: baseInvoice, isLoading: false, error: null,
    })
    renderPage()
    expect(screen.getByRole('link', { name: /kembali/i })).toBeInTheDocument()
  })
})