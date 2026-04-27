import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'

vi.mock('@/hooks/admin/useAdminStats', () => ({
  useAdminStats: vi.fn(),
}))

import { useAdminStats } from '@/hooks/admin/useAdminStats'

const mockUseAdminStats = vi.mocked(useAdminStats)

const mockStats = {
  total_invoices: 10,
  total_paid: 6,
  total_failed: 2,
  total_expired: 2,
  total_transaction_amount: 900000,
  total_refund_amount: 150000,
}

const renderPage = () =>
  render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAdminStats.mockReturnValue({
      stats: mockStats, isLoading: false, error: null,
    })
  })

  it('shows loading spinner', () => {
    mockUseAdminStats.mockReturnValue({ stats: null, isLoading: true, error: null })
    renderPage()
    expect(screen.getByText('Memuat statistik...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseAdminStats.mockReturnValue({
      stats: null, isLoading: false, error: 'Gagal memuat statistik.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat statistik.')).toBeInTheDocument()
  })

  it('renders all stat cards', () => {
    renderPage()
    expect(screen.getByText('Total Invoice')).toBeInTheDocument()
    expect(screen.getByText('Invoice Lunas')).toBeInTheDocument()
    expect(screen.getByText('Total Transaksi')).toBeInTheDocument()
    expect(screen.getByText('Invoice Gagal')).toBeInTheDocument()
    expect(screen.getByText('Invoice Expired')).toBeInTheDocument()
    expect(screen.getByText('Total Refund')).toBeInTheDocument()
  })

  it('renders correct stat values', () => {
    renderPage()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getAllByText('2')[0]).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    renderPage()
    expect(screen.getByText('Payment Simulation')).toBeInTheDocument()
    expect(screen.getByText('Refund Management')).toBeInTheDocument()
    expect(screen.getByText('Top-up Approval')).toBeInTheDocument()
  })
})