import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, RegisterPayload } from '@/api/authApi'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleRegister = async (payload: RegisterPayload) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await authApi.register(payload)
      const { token, user } = res.data.data

      login(user, token)
      navigate(ROUTES.MERCHANT_DASHBOARD, { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      setErrorMessage(
        error.response?.data?.error?.message ?? 'Registrasi gagal, coba lagi.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { handleRegister, isLoading, errorMessage }
}