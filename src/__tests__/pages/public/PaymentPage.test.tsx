import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PaymentPage from '@/pages/public/PaymentPage'

vi.mock('@/hooks/public/usePayment', () => ({
  usePayment: vi.fn(),
}))

import { usePayment } from '@/hooks/public/usePayment'

const mockUsePayment = vi.mocked(usePayment)

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

const defaultHookReturn = {
  invoice: baseInvoice,
  paymentIntent: null,
  isLoadingInvoice: false,
  isSubmitting: false,
  error: null,
  selectedMethod: null,
  setSelectedMethod: vi.fn(),
  handlePay: vi.fn(),
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/pay/tok-abc']}>
      <Routes>
        <Route path="/pay/:token" element={<PaymentPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePayment.mockReturnValue(defaultHookReturn)
  })

  it('shows loading spinner when loading invoice', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      isLoadingInvoice: true,
    })
    renderPage()
    expect(screen.getByText('Memuat halaman pembayaran...')).toBeInTheDocument()
  })

  it('shows error when invoice not found', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      invoice: null,
      error: 'Link pembayaran tidak valid atau sudah kedaluwarsa.',
    })
    renderPage()
    expect(
      screen.getByText('Link pembayaran tidak valid atau sudah kedaluwarsa.')
    ).toBeInTheDocument()
  })

  it('renders invoice details', () => {
    renderPage()
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('Andi')).toBeInTheDocument()
    expect(screen.getByText('Pembelian produk A')).toBeInTheDocument()
  })

  it('renders payment method options', () => {
    renderPage()
    expect(screen.getByText('Wallet')).toBeInTheDocument()
    expect(screen.getByText('Virtual Account')).toBeInTheDocument()
    expect(screen.getByText('E-Wallet')).toBeInTheDocument()
  })

  it('calls setSelectedMethod when method clicked', async () => {
    const user = userEvent.setup()
    const mockSetMethod = vi.fn()

    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      setSelectedMethod: mockSetMethod,
    })

    renderPage()
    await user.click(screen.getByText('Wallet'))
    expect(mockSetMethod).toHaveBeenCalledWith('WALLET')
  })

  it('shows submitting state when isSubmitting true', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      selectedMethod: 'WALLET',
      isSubmitting: true,
    })
    renderPage()
    expect(screen.getByRole('button', { name: /memproses/i })).toBeDisabled()
  })

  it('shows pending intent status', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      paymentIntent: {
        id: 'pi-1',
        invoice_id: 'inv-1',
        invoice_number: 'INV-001',
        merchant_name: 'Dindin',
        method: 'WALLET',
        status: 'PENDING',
        created_at: '2025-04-01T09:00:00Z',
      },
    })
    renderPage()
    expect(screen.getByText('Menunggu Konfirmasi')).toBeInTheDocument()
  })

  it('shows failed intent status', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      paymentIntent: {
        id: 'pi-1',
        invoice_id: 'inv-1',
        invoice_number: 'INV-001',
        merchant_name: 'Dindin',
        method: 'WALLET',
        status: 'FAILED',
        created_at: '2025-04-01T09:00:00Z',
      },
    })
    renderPage()
    expect(screen.getByText('Pembayaran Gagal')).toBeInTheDocument()
  })

  it('shows success banner when invoice is PAID', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      invoice: { ...baseInvoice, status: 'PAID' },
    })
    renderPage()
    expect(screen.getByText('Pembayaran Berhasil!')).toBeInTheDocument()
  })

  it('shows expired banner when invoice is EXPIRED', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      invoice: { ...baseInvoice, status: 'EXPIRED' },
    })
    renderPage()
    expect(screen.getByText('Invoice Kedaluwarsa')).toBeInTheDocument()
  })

  it('hides payment form when invoice is PAID', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      invoice: { ...baseInvoice, status: 'PAID' },
    })
    renderPage()
    expect(screen.queryByText('Pilih Metode Pembayaran')).not.toBeInTheDocument()
  })

  it('hides payment form when paymentIntent exists', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      paymentIntent: {
        id: 'pi-1',
        invoice_id: 'inv-1',
        invoice_number: 'INV-001',
        merchant_name: 'Dindin',
        method: 'WALLET',
        status: 'PENDING',
        created_at: '2025-04-01T09:00:00Z',
      },
    })
    renderPage()
    expect(screen.queryByText('Pilih Metode Pembayaran')).not.toBeInTheDocument()
  })

  it('shows error from API on payment form', () => {
    mockUsePayment.mockReturnValue({
      ...defaultHookReturn,
      error: 'Gagal membuat pembayaran.',
    })
    renderPage()
    expect(screen.getByText('Gagal membuat pembayaran.')).toBeInTheDocument()
  })
})