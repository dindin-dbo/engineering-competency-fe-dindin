import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { ROUTES } from '@/constants/routes'

const pageTitles: Record<string, string> = {
  [ROUTES.MERCHANT_DASHBOARD]: 'Dashboard',
  [ROUTES.MERCHANT_INVOICES]: 'Invoice',
  [ROUTES.MERCHANT_INVOICE_CREATE]: 'Buat Invoice',
  [ROUTES.MERCHANT_WALLET]: 'Wallet',
  [ROUTES.MERCHANT_TRANSACTIONS]: 'Riwayat Transaksi',
  [ROUTES.MERCHANT_REFUNDS]: 'Refund',
}

export default function MerchantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const title = pageTitles[pathname] ?? 'Merchant'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  )
}