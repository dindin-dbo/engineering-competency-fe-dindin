import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CreateInvoicePage from '@/pages/merchant/Invoice/CreateInvoicePage'

vi.mock('@/hooks/merchant/Invoice/useCreateInvoice', () => ({
  useCreateInvoice: vi.fn(),
}))

import { useCreateInvoice } from '@/hooks/merchant/Invoice/useCreateInvoice'

const mockUseCreateInvoice = vi.mocked(useCreateInvoice)

const renderPage = () =>
  render(<MemoryRouter><CreateInvoicePage /></MemoryRouter>)

describe('CreateInvoicePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateInvoice.mockReturnValue({
      handleCreate: vi.fn(),
      isLoading: false,
      errorMessage: null,
    })
  })

  it('renders all form fields', () => {
    renderPage()
    expect(screen.getByLabelText('Nama Customer')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Customer')).toBeInTheDocument()
    expect(screen.getByLabelText('Jumlah (IDR)')).toBeInTheDocument()
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Deskripsi')).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /buat invoice/i })).toBeInTheDocument()
    expect(screen.getByText('Batal')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /buat invoice/i }))

    await waitFor(() => {
      expect(screen.getByText('Nama customer wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Email customer wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument()
    })
  })

  it('shows error when amount is 0', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Nama Customer'), 'Andi Santoso')
    await user.type(screen.getByLabelText('Email Customer'), 'andi@test.com')
    await user.type(screen.getByLabelText('Deskripsi'), 'Test')
    await user.click(screen.getByRole('button', { name: /buat invoice/i }))

    await waitFor(() => {
      expect(screen.getByText('Jumlah harus lebih dari 0')).toBeInTheDocument()
    })
  })

  it('shows API error message', () => {
    mockUseCreateInvoice.mockReturnValue({
      handleCreate: vi.fn(),
      isLoading: false,
      errorMessage: 'Gagal membuat invoice, coba lagi.',
    })
    renderPage()
    expect(screen.getByText('Gagal membuat invoice, coba lagi.')).toBeInTheDocument()
  })

  it('disables submit when loading', () => {
    mockUseCreateInvoice.mockReturnValue({
      handleCreate: vi.fn(),
      isLoading: true,
      errorMessage: null,
    })
    renderPage()
    expect(screen.getByRole('button', { name: /membuat/i })).toBeDisabled()
  })


  it('calls handleCreate with correct values', async () => {
    const user = userEvent.setup()
    const mockHandleCreate = vi.fn()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
  
    mockUseCreateInvoice.mockReturnValue({
      handleCreate: mockHandleCreate,
      isLoading: false,
      errorMessage: null,
    })
  
    renderPage()
  
    await user.type(screen.getByLabelText('Nama Customer'), 'Andi Santoso')
    await user.type(screen.getByLabelText('Email Customer'), 'andi@test.com')
    await user.type(screen.getByLabelText('Jumlah (IDR)'), '100000')
    await user.type(screen.getByLabelText('Deskripsi'), 'Test invoice')
  
    // date input pakai fireEvent.change
    fireEvent.change(screen.getByLabelText('Due Date'), {
      target: { value: tomorrowStr },
    })
  
    await user.click(screen.getByRole('button', { name: /buat invoice/i }))
  
    await waitFor(() => {
      expect(mockHandleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_name: 'Andi Santoso',
          customer_email: 'andi@test.com',
          description: 'Test invoice',
        }),
        expect.anything()
      )
    })
  })
})