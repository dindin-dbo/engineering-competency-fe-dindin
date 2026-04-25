import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TransactionHistoryPage from '@/pages/merchant/Transaksi/TransactionHistoryPage'

vi.mock('@/hooks/merchant/Transaksi/useTransactionHistory', () => ({
  useTransactionHistory: vi.fn(),
}))

import { useTransactionHistory } from '@/hooks/merchant/Transaksi/useTransactionHistory'

const mockUseTransactionHistory = vi.mocked(useTransactionHistory)

const mockTransactions = [
  {
    id: 'payment-inv-1',
    type: 'PAYMENT_IN' as const,
    amount: 150000,
    description: 'Pembayaran dari Andi',
    reference: 'INV-001',
    date: '2025-04-03T00:00:00Z',
    raw: {} as any,
  },
  {
    id: 'topup-topup-1',
    type: 'TOPUP_IN' as const,
    amount: 200000,
    description: 'Top-up saldo wallet',
    reference: 'topup-1',
    date: '2025-04-02T00:00:00Z',
    raw: {} as any,
  },
  {
    id: 'refund-ref-1',
    type: 'REFUND_OUT' as const,
    amount: 150000,
    description: 'Refund ke INV-001',
    reference: 'INV-001',
    date: '2025-04-01T00:00:00Z',
    raw: {} as any,
  },
]

const defaultReturn = {
  transactions: mockTransactions,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

const renderPage = () =>
  render(<MemoryRouter><TransactionHistoryPage /></MemoryRouter>)

describe('TransactionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTransactionHistory.mockReturnValue(defaultReturn)
  })

  it('shows loading spinner', () => {
    mockUseTransactionHistory.mockReturnValue({
      ...defaultReturn,
      isLoading: true,
    })
    renderPage()
    expect(screen.getByText('Memuat riwayat transaksi...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseTransactionHistory.mockReturnValue({
      ...defaultReturn,
      error: 'Gagal memuat riwayat transaksi.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat riwayat transaksi.')).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    renderPage()
    expect(screen.getAllByText('Total Pembayaran Masuk')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Total Top-up')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Total Refund Keluar')[0]).toBeInTheDocument()
  })

  it('renders net cash flow card', () => {
    renderPage()
    expect(screen.getByText('Net Arus Kas')).toBeInTheDocument()
  })

  it('renders correct net cash flow amount', () => {
    renderPage()
    // totalIn = 150000 + 200000 = 350000, totalOut = 150000, net = 200000
    expect(screen.getAllByText('+Rp 200.000')[0]).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    renderPage()
    expect(screen.getAllByText('Semua')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Pembayaran Masuk')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Top-up')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Refund Keluar')[0]).toBeInTheDocument()
  })

  it('renders all transactions by default', () => {
    renderPage()
    expect(screen.getAllByText('INV-001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pembayaran dari Andi')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Top-up saldo wallet')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Refund ke INV-001')[0]).toBeInTheDocument()
  })

  it('filters to show only PAYMENT_IN when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Pembayaran Masuk'))

    await waitFor(() => {
      expect(screen.getAllByText('Pembayaran dari Andi')[0]).toBeInTheDocument()
      expect(screen.queryByText('Top-up saldo wallet')).not.toBeInTheDocument()
      expect(screen.queryByText('Refund ke INV-001')).not.toBeInTheDocument()
    })
  })

  it('filters to show only TOPUP_IN when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getAllByText('Top-up')[0])

    await waitFor(() => {
      expect(screen.getAllByText('Top-up saldo wallet')[0]).toBeInTheDocument()
      expect(screen.queryByText('Pembayaran dari Andi')).not.toBeInTheDocument()
    })
  })

  it('filters to show only REFUND_OUT when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Refund Keluar'))

    await waitFor(() => {
      expect(screen.getAllByText('Refund ke INV-001')[0]).toBeInTheDocument()
      expect(screen.queryByText('Pembayaran dari Andi')).not.toBeInTheDocument()
    })
  })

  it('shows all transactions again when Semua clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Pembayaran Masuk'))
    await user.click(screen.getByText('Semua'))

    await waitFor(() => {
      expect(screen.getAllByText('Pembayaran dari Andi')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Top-up saldo wallet')[0]).toBeInTheDocument()
    })
  })

  it('shows empty state when no transactions', () => {
    mockUseTransactionHistory.mockReturnValue({
      ...defaultReturn,
      transactions: [],
    })
    renderPage()
    expect(screen.getByText('Tidak ada transaksi')).toBeInTheDocument()
  })

  it('shows empty state when filter has no results', async () => {
    const user = userEvent.setup()
    mockUseTransactionHistory.mockReturnValue({
      ...defaultReturn,
      transactions: mockTransactions.filter((t) => t.type === 'PAYMENT_IN'),
    })
    renderPage()

    await user.click(screen.getByText('Refund Keluar'))

    await waitFor(() => {
      expect(screen.getByText('Tidak ada transaksi')).toBeInTheDocument()
    })
  })

  it('shows transaction count in filter bar', () => {
    renderPage()
    expect(screen.getAllByText('3 transaksi')[0]).toBeInTheDocument()
  })

  it('updates transaction count after filter', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Pembayaran Masuk'))

    await waitFor(() => {
      expect(screen.getAllByText('1 transaksi')[0]).toBeInTheDocument()
    })
  })

  it('active filter button has blue styling', () => {
    renderPage()
    const allBtn = screen.getByText('Semua')
    expect(allBtn.className).toContain('bg-blue-600')
  })

  it('shows negative net when refunds exceed income', () => {
    mockUseTransactionHistory.mockReturnValue({
      ...defaultReturn,
      transactions: [
        {
          id: 'refund-1',
          type: 'REFUND_OUT',
          amount: 500000,
          description: 'Refund besar',
          reference: 'INV-001',
          date: '2025-04-01T00:00:00Z',
          raw: {} as any,
        },
      ],
    })
    renderPage()
    expect(screen.getAllByText('-Rp 500.000')[0]).toBeInTheDocument()
  })
})