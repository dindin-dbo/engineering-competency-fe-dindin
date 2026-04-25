import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRegister } from '@/hooks/auth/useRegister'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/api/authApi', () => ({
  authApi: { register: vi.fn() },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({ login: vi.fn() }),
}))

import { authApi } from '@/api/authApi'
import { ROUTES } from '@/constants/routes'

const mockAuthApi = vi.mocked(authApi)
const mockAxiosResponse = <T>(data: T) => ({ data } as never)

const payload = { name: 'Dindin', email: 'dindin@test.com', password: 'password123' }

describe('useRegister', () => {
  beforeEach(() => vi.clearAllMocks())

  it('initial state should be idle', () => {
    const { result } = renderHook(() => useRegister())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should set isLoading true while registering', async () => {
    mockAuthApi.register.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    const { result } = renderHook(() => useRegister())

    act(() => { result.current.handleRegister(payload) })
    expect(result.current.isLoading).toBe(true)
  })

  it('should navigate to merchant dashboard on success', async () => {
    mockAuthApi.register.mockResolvedValue(
      mockAxiosResponse({
        data: {
          token: 'mock-token',
          user: { id: '3', name: 'Dindin', email: 'dindin@test.com', role: 'MERCHANT' },
        },
      })
    )

    const { result } = renderHook(() => useRegister())
    await act(async () => { await result.current.handleRegister(payload) })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MERCHANT_DASHBOARD, { replace: true })
    })
  })

  it('should set errorMessage on failed register', async () => {
    mockAuthApi.register.mockRejectedValue({
      response: { data: { error: { message: 'Email already registered' } } },
    })

    const { result } = renderHook(() => useRegister())
    await act(async () => { await result.current.handleRegister(payload) })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Email already registered')
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should set fallback errorMessage when no error from API', async () => {
    mockAuthApi.register.mockRejectedValue({})

    const { result } = renderHook(() => useRegister())
    await act(async () => { await result.current.handleRegister(payload) })

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('Registrasi gagal, coba lagi.')
    })
  })

  it('should reset errorMessage on new register attempt', async () => {
    mockAuthApi.register.mockRejectedValueOnce({
      response: { data: { error: { message: 'Email already registered' } } },
    })

    const { result } = renderHook(() => useRegister())
    await act(async () => { await result.current.handleRegister(payload) })
    expect(result.current.errorMessage).toBe('Email already registered')

    mockAuthApi.register.mockResolvedValueOnce(
      mockAxiosResponse({
        data: {
          token: 'mock-token',
          user: { id: '3', name: 'Dindin', email: 'dindin@test.com', role: 'MERCHANT' },
        },
      })
    )

    await act(async () => { await result.current.handleRegister(payload) })
    await waitFor(() => { expect(result.current.errorMessage).toBeNull() })
  })
})