import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogin } from '@/hooks/useLogin'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({ login: vi.fn() }),
}))

import { authApi } from '@/api/authApi'
import { ROUTES } from '@/constants/routes'

const mockAuthApi = vi.mocked(authApi)

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initial state should be idle', () => {
    const { result } = renderHook(() => useLogin())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should set isLoading true while logging in', async () => {
    mockAuthApi.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.handleLogin({ email: 'merchant@test.com', password: 'password123' })
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should navigate to merchant dashboard on MERCHANT login', async () => {
    mockAuthApi.login.mockResolvedValue({
      data: {
        data: {
          token: 'mock-token',
          user: { id: '1', name: 'Budi', email: 'merchant@test.com', role: 'MERCHANT' },
        },
      },
    } as never)

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLogin({ email: 'merchant@test.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MERCHANT_DASHBOARD, { replace: true })
    })
  })

  it('should navigate to admin dashboard on ADMIN login', async () => {
    mockAuthApi.login.mockResolvedValue({
      data: {
        data: {
          token: 'mock-token',
          user: { id: '2', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
        },
      },
    } as never)

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLogin({ email: 'admin@test.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ADMIN_DASHBOARD, { replace: true })
    })
  })

  it('should set errorMessage on failed login', async () => {
    mockAuthApi.login.mockRejectedValue({
      response: {
        data: {
          error: { message: 'Invalid email or password' },
        },
      },
    })

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLogin({ email: 'wrong@test.com', password: 'wrongpass' })
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Invalid email or password')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should set fallback errorMessage when no error message from API', async () => {
    mockAuthApi.login.mockRejectedValue({})

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLogin({ email: 'a@b.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Login gagal, coba lagi.')
    })
  })

  it('should reset errorMessage on new login attempt', async () => {
    mockAuthApi.login.mockRejectedValueOnce({
      response: { data: { error: { message: 'Invalid email or password' } } },
    })

    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLogin({ email: 'a@b.com', password: 'wrongpass' })
    })

    expect(result.current.errorMessage).toBe('Invalid email or password')

    mockAuthApi.login.mockResolvedValueOnce({
      data: {
        data: {
          token: 'mock-token',
          user: { id: '1', name: 'Budi', email: 'merchant@test.com', role: 'MERCHANT' },
        },
      },
    } as never)

    await act(async () => {
      await result.current.handleLogin({ email: 'merchant@test.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(result.current.errorMessage).toBeNull()
    })
  })
})