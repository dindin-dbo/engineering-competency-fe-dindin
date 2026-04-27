import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WalletPage from '@/pages/merchant/Wallet/WalletPage'

vi.mock('@/hooks/merchant/Wallet/useWallet', () => ({
  useWallet: vi.fn(),
}))

import { useWallet } from '@/hooks/merchant/Wallet/useWallet'

const mockUseWallet = vi.mocked(useWallet)

const defaultHookReturn = {
  wallet: { id: 'w1', merchant_id: 'u1', balance: 500000 },
  topupHistory: [
    {
      id: 'topup-1',
      merchant_id: 'u1',
      merchant_name: 'Dindin',
      amount: 100000,
      status: 'PENDING' as const,
      created_at: '2025-04-01T00:00:00Z',
    },
  ],
  isLoading: false,
  isSubmitting: false,
  error: null,
  topupError: null,
  topupSuccess: false,
  handleTopup: vi.fn(),
  refetch: vi.fn(),
}

const renderPage = () =>
  render(<MemoryRouter><WalletPage /></MemoryRouter>)

describe('WalletPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWallet.mockReturnValue(defaultHookReturn)
  })

  it('shows loading spinner', () => {
    mockUseWallet.mockReturnValue({ ...defaultHookReturn, isLoading: true })
    renderPage()
    expect(screen.getByText('Memuat data wallet...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      error: 'Gagal memuat data wallet.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat data wallet.')).toBeInTheDocument()
  })

  it('renders wallet balance', () => {
    renderPage()
    expect(screen.getByText('Saldo Wallet')).toBeInTheDocument()
    expect(screen.getAllByText('Rp 500.000')[0]).toBeInTheDocument()
  })

  it('renders topup form', () => {
    renderPage()
    expect(screen.getByLabelText('Jumlah Top-up (IDR)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ajukan top-up/i })).toBeInTheDocument()
  })

  it('renders quick amount buttons', () => {
    renderPage()
    expect(screen.getAllByText('Rp 50.000')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Rp 100.000')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Rp 250.000')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Rp 500.000')[0]).toBeInTheDocument()
  })

  it('renders topup history', () => {
    renderPage()
    expect(screen.getAllByText('Riwayat Top-up')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Rp 100.000')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument()
  })

  it('shows empty state when no topup history', () => {
    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      topupHistory: [],
    })
    renderPage()
    expect(screen.getByText('Belum ada riwayat top-up')).toBeInTheDocument()
  })

  it('shows success message when topupSuccess is true', () => {
    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      topupSuccess: true,
    })
    renderPage()
    expect(screen.getByText(/request top-up berhasil diajukan/i)).toBeInTheDocument()
  })

  it('shows topupError message', () => {
    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      topupError: 'Gagal mengajukan top-up.',
    })
    renderPage()
    expect(screen.getByText('Gagal mengajukan top-up.')).toBeInTheDocument()
  })

  it('shows validation error when amount is too low', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = screen.getByLabelText('Jumlah Top-up (IDR)')
    await user.clear(input)
    await user.type(input, '5000')
    await user.click(screen.getByRole('button', { name: /ajukan top-up/i }))

    await waitFor(() => {
      expect(screen.getByText('Minimal top-up Rp 10.000')).toBeInTheDocument()
    })
  })

  it('calls handleTopup with correct amount', async () => {
    const user = userEvent.setup()
    const mockHandleTopup = vi.fn()

    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      handleTopup: mockHandleTopup,
    })

    renderPage()

    const input = screen.getByLabelText('Jumlah Top-up (IDR)')
    await user.clear(input)
    await user.type(input, '100000')
    await user.click(screen.getByRole('button', { name: /ajukan top-up/i }))

    await waitFor(() => {
      expect(mockHandleTopup).toHaveBeenCalledWith(100000)
    })
  })

  it('disables submit button when isSubmitting', () => {
    mockUseWallet.mockReturnValue({
      ...defaultHookReturn,
      isSubmitting: true,
    })
    renderPage()
    expect(screen.getByRole('button', { name: /mengajukan/i })).toBeDisabled()
  })
})