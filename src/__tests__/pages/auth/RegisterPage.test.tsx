import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '@/pages/auth/RegisterPage'

vi.mock('@/hooks/auth/useRegister', () => ({
  useRegister: vi.fn(),
}))

import { useRegister } from '@/hooks/auth/useRegister'

const mockUseRegister = vi.mocked(useRegister)

const renderRegisterPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRegister.mockReturnValue({
      handleRegister: vi.fn(),
      isLoading: false,
      errorMessage: null,
    })
  })

  it('renders all form fields', () => {
    renderRegisterPage()
    expect(screen.getByLabelText('Nama lengkap')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Konfirmasi password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buat akun/i })).toBeInTheDocument()
  })

  it('renders login link', () => {
    renderRegisterPage()
    expect(screen.getByText(/masuk di sini/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.click(screen.getByRole('button', { name: /buat akun/i }))

    await waitFor(() => {
      expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Email wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Password wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Konfirmasi password wajib diisi')).toBeInTheDocument()
    })
  })

  it('shows error when name is too short', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nama lengkap'), 'Bu')
    await user.click(screen.getByRole('button', { name: /buat akun/i }))

    await waitFor(() => {
      expect(screen.getByText('Nama minimal 3 karakter')).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Konfirmasi password'), 'password999')
    await user.click(screen.getByRole('button', { name: /buat akun/i }))

    await waitFor(() => {
      expect(screen.getByText('Password tidak cocok')).toBeInTheDocument()
    })
  })

  it('calls handleRegister with correct values on valid submit', async () => {
    const user = userEvent.setup()
    const mockHandleRegister = vi.fn()

    mockUseRegister.mockReturnValue({
      handleRegister: mockHandleRegister,
      isLoading: false,
      errorMessage: null,
    })

    renderRegisterPage()

    await user.type(screen.getByLabelText('Nama lengkap'), 'Dindin Mahpudin')
    await user.type(screen.getByLabelText('Email'), 'budi@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Konfirmasi password'), 'password123')
    await user.click(screen.getByRole('button', { name: /buat akun/i }))

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Dindin Mahpudin',
          email: 'budi@test.com',
          password: 'password123',
        })
      )
    })
  })

  it('shows API error message when errorMessage is set', () => {
    mockUseRegister.mockReturnValue({
      handleRegister: vi.fn(),
      isLoading: false,
      errorMessage: 'Email already registered',
    })

    renderRegisterPage()
    expect(screen.getByText('Email already registered')).toBeInTheDocument()
  })

  it('disables submit button when isLoading is true', () => {
    mockUseRegister.mockReturnValue({
      handleRegister: vi.fn(),
      isLoading: true,
      errorMessage: null,
    })

    renderRegisterPage()
    expect(screen.getByRole('button', { name: /mendaftar/i })).toBeDisabled()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /tampilkan password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /sembunyikan password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('toggles confirm password visibility', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    const confirmInput = screen.getByLabelText('Konfirmasi password')
    expect(confirmInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /tampilkan konfirmasi password/i }))
    expect(confirmInput).toHaveAttribute('type', 'text')
  })
})