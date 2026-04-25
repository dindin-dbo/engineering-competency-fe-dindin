import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MerchantDashboardPage from '@/pages/merchant/Dashboard/DashboardPage'

vi.mock('@/hooks/merchant/Dashboard/useDashboard', () => ({
  useDashboard: vi.fn(),
}))

import { useDashboard } from '@/hooks/merchant/Dashboard/useDashboard'

const mockUseDashboard = vi.mocked(useDashboard)

const mockData = {
  wallet: { id: 'w1', merchant_id: 'u1', balance: 500000 },
  recentInvoices: [
    {
      id: 'inv-1',
      merchant_id: 'u1',
      invoice_number: 'INV-001',
      customer_name: 'Andi',
      customer_email: 'andi@test.com',
      amount: 150000,
      description: 'Test',
      due_date: '2025-05-01',
      status: 'PENDING' as const,
      payment_link_token: 'tok1',
      created_at: '2025-04-01T00:00:00Z',
    },
  ],
  totalPaid: 2,
  totalPending: 1,
  totalExpired: 0,
  totalRevenue: 300000,
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <MerchantDashboardPage />
    </MemoryRouter>
  )

describe('MerchantDashboardPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading spinner when loading', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: true, error: null })
    renderPage()
    expect(screen.getByText('Memuat dashboard...')).toBeInTheDocument()
  })

  it('shows error message when error', () => {
    mockUseDashboard.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: 'Gagal memuat data dashboard.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat data dashboard.')).toBeInTheDocument()
  })

  it('renders stat cards when data loaded', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()

    expect(screen.getByText('Saldo Wallet')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Invoice Pending')).toBeInTheDocument()
    expect(screen.getByText('Invoice Expired')).toBeInTheDocument()
  })

  it('renders wallet balance correctly', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()
    expect(screen.getByText('Rp 500.000')).toBeInTheDocument()
  })

  it('renders recent invoice table', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()

    expect(screen.getAllByText('INV-001')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Andi')[0]).toBeInTheDocument()
  })

  it('renders empty state when no invoices', () => {
    mockUseDashboard.mockReturnValue({
      data: { ...mockData, recentInvoices: [] },
      isLoading: false,
      error: null,
    })
    renderPage()
    expect(screen.getByText('Belum ada invoice')).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()
    expect(screen.getByText('Buat Invoice')).toBeInTheDocument()
    expect(screen.getByText('Top Up Wallet')).toBeInTheDocument()
  })

  it('renders invoice status badge', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument()
  })

  it('renders total counts in stat cards', () => {
    mockUseDashboard.mockReturnValue({ data: mockData, isLoading: false, error: null })
    renderPage()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})