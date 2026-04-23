import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'

vi.mock('@/hooks/useLogin', () => ({
  useLogin: vi.fn(),
}))

import { useLogin } from '@/hooks/useLogin'

const mockUseLogin = vi.mocked(useLogin)

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLogin.mockReturnValue({
      handleLogin: vi.fn(),
      isLoading: false,
      errorMessage: null,
    })
  })

  it('renders login form elements', () => {
    renderLoginPage()

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument()
  })

  it('renders register link', () => {
    renderLoginPage()
    expect(screen.getByText(/daftar sebagai merchant/i)).toBeInTheDocument()
  })

  it('renders demo credentials section', () => {
    renderLoginPage()
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument()
    expect(screen.getByText(/merchant@test.com/i)).toBeInTheDocument()
    expect(screen.getByText(/admin@test.com/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /masuk/i }))

    await waitFor(() => {
      expect(screen.getByText('Email wajib diisi')).toBeInTheDocument()
      expect(screen.getByText('Password wajib diisi')).toBeInTheDocument()
    })
  })

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'bukan-email')
    await user.click(screen.getByRole('button', { name: /masuk/i }))

    await waitFor(() => {
      expect(screen.getByText('Format email tidak valid')).toBeInTheDocument()
    })
  })

  it('shows password length error for short password', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Password'), '123')
    await user.click(screen.getByRole('button', { name: /masuk/i }))

    await waitFor(() => {
      expect(screen.getByText('Password minimal 6 karakter')).toBeInTheDocument()
    })
  })

  it('calls handleLogin with correct values on valid submit', async () => {
    const user = userEvent.setup()
    const mockHandleLogin = vi.fn()
  
    mockUseLogin.mockReturnValue({
      handleLogin: mockHandleLogin,
      isLoading: false,
      errorMessage: null,
    })
  
    renderLoginPage()
  
    await user.type(screen.getByLabelText('Email'), 'merchant@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /masuk/i }))
  
    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledTimes(1)
      expect(mockHandleLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'merchant@test.com',
          password: 'password123',
        }),
        expect.anything()
      )
    })
  })

  it('shows API error message when errorMessage is set', () => {
    mockUseLogin.mockReturnValue({
      handleLogin: vi.fn(),
      isLoading: false,
      errorMessage: 'Invalid email or password',
    })

    renderLoginPage()

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })

  it('disables submit button when isLoading is true', () => {
    mockUseLogin.mockReturnValue({
      handleLogin: vi.fn(),
      isLoading: true,
      errorMessage: null,
    })

    renderLoginPage()

    expect(screen.getByRole('button', { name: /masuk/i })).toBeDisabled()
  })

  it('toggles password visibility when eye button clicked', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByRole('button', { name: /tampilkan password/i })
    await user.click(toggleBtn)

    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /sembunyikan password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})