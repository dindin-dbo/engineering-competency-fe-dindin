import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PaymentSimulationPage from '@/pages/admin/PaymentSimulationPage'

vi.mock('@/hooks/admin/usePaymentSimulation', () => ({
  usePaymentSimulation: vi.fn(),
}))

import { usePaymentSimulation } from '@/hooks/admin/usePaymentSimulation'

const mockHook = vi.mocked(usePaymentSimulation)

const mockIntents = [
  {
    id: 'pi-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-001',
    merchant_name: 'Dindin Merchant',
    method: 'WALLET' as const,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'pi-2',
    invoice_id: 'inv-2',
    invoice_number: 'INV-002',
    merchant_name: 'Siti Merchant',
    method: 'VA_DUMMY' as const,
    status: 'SUCCESS' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
]

const defaultReturn = {
  intents: mockIntents,
  isLoading: false,
  processingId: null,
  error: null,
  search: '',
  setSearch: vi.fn(),
  handleUpdateStatus: vi.fn(),
  refetch: vi.fn(),
}

const renderPage = () =>
  render(<MemoryRouter><PaymentSimulationPage /></MemoryRouter>)

describe('PaymentSimulationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHook.mockReturnValue(defaultReturn)
  })

  it('shows loading spinner', () => {
    mockHook.mockReturnValue({ ...defaultReturn, isLoading: true })
    renderPage()
    expect(screen.getByText('Memuat payment intents...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockHook.mockReturnValue({
      ...defaultReturn, error: 'Gagal memuat payment intents.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat payment intents.')).toBeInTheDocument()
  })

  it('shows empty state when no intents', () => {
    mockHook.mockReturnValue({ ...defaultReturn, intents: [] })
    renderPage()
    expect(screen.getByText('Tidak ada payment intent')).toBeInTheDocument()
  })

  it('renders intent list', () => {
    renderPage()
    expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dindin Merchant').length).toBeGreaterThan(0)
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /cari payment intent/i })).toBeInTheDocument()
  })

  it('calls setSearch when typing in search', async () => {
    const user = userEvent.setup()
    const mockSetSearch = vi.fn()
    mockHook.mockReturnValue({ ...defaultReturn, setSearch: mockSetSearch })

    renderPage()
    await user.type(screen.getByRole('textbox', { name: /cari payment intent/i }), 'INV')

    expect(mockSetSearch).toHaveBeenCalled()
  })

  it('shows icon action buttons for PENDING intents', () => {
    renderPage()
    expect(screen.getAllByRole('button', { name: /approve inv-001/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /reject inv-001/i })[0]).toBeInTheDocument()
  })

  it('does not show action buttons for non-PENDING intents', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: /approve inv-002/i })).not.toBeInTheDocument()
  })

  it('opens confirm modal when approve clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve inv-001/i });
    await user.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Konfirmasi Pembayaran Berhasil')).toBeInTheDocument()
    })
  })

  it('opens confirm modal when reject clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const rejectButtons = screen.getAllByRole('button', { name: /reject inv-001/i });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Konfirmasi Pembayaran Gagal')).toBeInTheDocument()
    })
  })

  it('closes modal when cancel clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve inv-001/i });
    await user.click(approveButtons[0]);
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /batal/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls handleUpdateStatus when confirmed', async () => {
    const user = userEvent.setup()
    const mockHandleUpdate = vi.fn()
    mockHook.mockReturnValue({ ...defaultReturn, handleUpdateStatus: mockHandleUpdate })

    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve inv-001/i });
    await user.click(approveButtons[0]);
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /ya, tandai berhasil/i }))

    await waitFor(() => {
      expect(mockHandleUpdate).toHaveBeenCalledWith('pi-1', 'SUCCESS')
    })
  })
})