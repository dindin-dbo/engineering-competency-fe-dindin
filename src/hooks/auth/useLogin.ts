import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, LoginPayload } from '@/api/authApi'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async (payload: LoginPayload) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await authApi.login(payload)
      const { token, user } = res.data.data

      login(user, token)

      if (user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
      } else {
        navigate(ROUTES.MERCHANT_DASHBOARD, { replace: true })
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      setErrorMessage(
        error.response?.data?.error?.message ?? 'Login gagal, coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, errorMessage }
}