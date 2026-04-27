import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TopupApprovalPage from '@/pages/admin/TopupApprovalPage'

vi.mock('@/hooks/admin/useTopupApproval', () => ({
  useTopupApproval: vi.fn(),
}))

import { useTopupApproval } from '@/hooks/admin/useTopupApproval'

const mockHook = vi.mocked(useTopupApproval)

const mockRequests = [
  {
    id: 'topup-1',
    merchant_id: 'u1',
    merchant_name: 'Dindin Merchant',
    amount: 200000,
    status: 'PENDING' as const,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'topup-2',
    merchant_id: 'u2',
    merchant_name: 'Siti Merchant',
    amount: 500000,
    status: 'SUCCESS' as const,
    created_at: '2025-04-02T00:00:00Z',
  },
]

const defaultReturn = {
  requests: mockRequests,
  isLoading: false,
  processingId: null,
  error: null,
  handleUpdateStatus: vi.fn(),
  refetch: vi.fn(),
}

const renderPage = () =>
  render(<MemoryRouter><TopupApprovalPage /></MemoryRouter>)

describe('TopupApprovalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHook.mockReturnValue(defaultReturn)
  })

  it('shows loading spinner', () => {
    mockHook.mockReturnValue({ ...defaultReturn, isLoading: true })
    renderPage()
    expect(screen.getByText('Memuat balance requests...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockHook.mockReturnValue({
      ...defaultReturn, error: 'Gagal memuat balance requests.',
    })
    renderPage()
    expect(screen.getByText('Gagal memuat balance requests.')).toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    mockHook.mockReturnValue({ ...defaultReturn, requests: [] })
    renderPage()
    expect(screen.getByText('Tidak ada permintaan top-up')).toBeInTheDocument()
  })

  it('renders request list', () => {
    renderPage()
    expect(screen.getAllByText('Dindin Merchant').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Siti Merchant').length).toBeGreaterThan(0)
  })

  it('shows approve and reject buttons for PENDING requests', () => {
    renderPage()
    expect(screen.getAllByRole('button', { name: /approve topup dindin merchant/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /reject topup dindin merchant/i })[0]).toBeInTheDocument()
  })

  it('does not show buttons for non-PENDING requests', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: /approve topup siti merchant/i })).not.toBeInTheDocument()
  })

  it('opens confirm modal when approve clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve topup dindin merchant/i });
    await user.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByText('Approve Top-up')[0]).toBeInTheDocument()
    })
  })

  it('opens confirm modal when reject clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const rejectButtons = screen.getAllByRole('button', { name: /reject topup dindin merchant/i });
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByText('Reject Top-up')[0]).toBeInTheDocument()
    })
  })

  it('closes modal when cancel clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve topup dindin merchant/i });
    await user.click(approveButtons[0]);
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /batal/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('calls handleUpdateStatus when approve confirmed', async () => {
    const user = userEvent.setup()
    const mockHandle = vi.fn()
    mockHook.mockReturnValue({ ...defaultReturn, handleUpdateStatus: mockHandle })

    renderPage()

    const approveButtons = screen.getAllByRole('button', { name: /approve topup dindin merchant/i });
    await user.click(approveButtons[0]);
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /ya, approve/i }))

    await waitFor(() => {
      expect(mockHandle).toHaveBeenCalledWith('topup-1', 'SUCCESS')
    })
  })

  it('calls handleUpdateStatus with FAILED when reject confirmed', async () => {
    const user = userEvent.setup()
    const mockHandle = vi.fn()
    mockHook.mockReturnValue({ ...defaultReturn, handleUpdateStatus: mockHandle })

    renderPage()

    const rejectButtons = screen.getAllByRole('button', { name: /reject topup dindin merchant/i });
    await user.click(rejectButtons[0]);
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: /ya, reject/i }))

    await waitFor(() => {
      expect(mockHandle).toHaveBeenCalledWith('topup-1', 'FAILED')
    })
  })
})