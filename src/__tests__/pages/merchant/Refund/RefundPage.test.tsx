import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RefundPage from '@/pages/merchant/Refund/RefundPage'

vi.mock('@/hooks/merchant/Refund/useRefund', () => ({
  useRefund: vi.fn(),
}))

vi.mock('@/hooks/merchant/Invoice/useInvoices', () => ({
  useInvoices: vi.fn(),
}))

import { useRefund } from '@/hooks/merchant/Refund/useRefund'
import { useInvoices } from '@/hooks/merchant/Invoice/useInvoices'

const mockUseRefund = vi.mocked(useRefund)
const mockUseInvoices = vi.mocked(useInvoices)

const mockRefunds = [
  {
    id: 'refund-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_id: 'u1',
    merchant_name: 'Budi',
    amount: 150000,
    reason: 'Produk tidak sesuai deskripsi',
    status: 'REQUESTED' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
]

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
    created_at: '2025-04-01T00:00:00Z',
  },
]

const defaultRefundReturn = {
  refunds: mockRefunds,
  isLoading: false,
  isSubmitting: false,
  error: null,
  submitError: null,
  submitSuccess: false,
  handleCreateRefund: vi.fn(),
  refetch: vi.fn(),
}

const defaultInvoicesReturn = {
  invoices: mockPaidInvoices,
  meta: null,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

const renderPage = () =>
  render(<MemoryRouter><RefundPage /></MemoryRouter>)

describe('RefundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRefund.mockReturnValue(defaultRefundReturn)
    mockUseInvoices.mockReturnValue(defaultInvoicesReturn)
  })

  it('shows loading spinner', () => {
    mockUseRefund.mockReturnValue({ ...defaultRefundReturn, isLoading: true })
    renderPage()
    expect(screen.getByText('Memuat data refund...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseRefund.mockReturnValue({
      ...defaultRefundReturn,
      error: 'Gagal memuat daftar refund.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat daftar refund.')).toBeInTheDocument()
  })

  it('renders header and ajukan button', () => {
    renderPage()
    expect(screen.getByText('Refund')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ajukan refund/i })).toBeInTheDocument()
  })

  it('shows refund form when ajukan button clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))

    await waitFor(() => {
      expect(screen.getByText('Form Pengajuan Refund')).toBeInTheDocument()
    })
  })

  it('renders refund list', () => {
    renderPage()
    expect(screen.getByText('Riwayat Refund')).toBeInTheDocument()
    expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0)
  })

  it('shows empty state when no refunds', () => {
    mockUseRefund.mockReturnValue({ ...defaultRefundReturn, refunds: [] })
    renderPage()
    expect(screen.getByText('Belum ada pengajuan refund')).toBeInTheDocument()
  })

  it('shows submit success message', async () => {
    const user = userEvent.setup()
    mockUseRefund.mockReturnValue({
      ...defaultRefundReturn,
      submitSuccess: true,
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => {
      expect(screen.getByText('Refund berhasil diajukan!')).toBeInTheDocument()
    })
  })

  it('shows submit error message', async () => {
    const user = userEvent.setup()
    mockUseRefund.mockReturnValue({
      ...defaultRefundReturn,
      submitError: 'Invoice tidak valid.',
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => {
      expect(screen.getByText('Invoice tidak valid.')).toBeInTheDocument()
    })
  })

  it('shows validation error when reason is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => screen.getByText('Form Pengajuan Refund'))

    await user.selectOptions(screen.getByRole('combobox'), 'inv-1')
    await user.type(screen.getByLabelText('Alasan Refund'), 'Pendek')
    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))

    await waitFor(() => {
      expect(screen.getByText('Alasan minimal 10 karakter')).toBeInTheDocument()
    })
  })

  it('shows validation error when no invoice selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => screen.getByText('Form Pengajuan Refund'))

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))

    await waitFor(() => {
      expect(screen.getByText('Invoice wajib dipilih')).toBeInTheDocument()
    })
  })

  it('calls handleCreateRefund with correct values', async () => {
    const user = userEvent.setup()
    const mockHandleCreate = vi.fn()

    mockUseRefund.mockReturnValue({
      ...defaultRefundReturn,
      handleCreateRefund: mockHandleCreate,
    })

    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => screen.getByText('Form Pengajuan Refund'))

    await user.selectOptions(screen.getByRole('combobox'), 'inv-1')
    await user.type(
      screen.getByLabelText('Alasan Refund'),
      'Produk tidak sesuai dengan deskripsi'
    )
    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))

    await waitFor(() => {
      expect(mockHandleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          invoice_id: 'inv-1',
          reason: 'Produk tidak sesuai dengan deskripsi',
        })
      )
    })
  })

  it('disables submit when isSubmitting', async () => {
    const user = userEvent.setup()
    mockUseRefund.mockReturnValue({
      ...defaultRefundReturn,
      isSubmitting: true,
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: /ajukan refund/i }))
    await waitFor(() => screen.getByText('Form Pengajuan Refund'))

    const submitBtn = screen.getByRole('button', { name: /mengajukan/i })
    expect(submitBtn).toBeDisabled()
  })
})