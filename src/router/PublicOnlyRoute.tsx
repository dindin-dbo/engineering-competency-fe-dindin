import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export default function PublicOnlyRoute() {
  const { token, role } = useAuthStore()

  if (token) {
    const redirect =
      role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.MERCHANT_DASHBOARD
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}