import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const handleBack = () => {
    const redirect =
      role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.MERCHANT_DASHBOARD
    navigate(redirect, { replace: true })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-semibold text-gray-800">403 - Akses Ditolak</h1>
      <p className="text-gray-500">Kamu tidak punya akses ke halaman ini.</p>
      <button
        onClick={handleBack}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Kembali ke Dashboard
      </button>
    </div>
  )
}