import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'

import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

// Layout
import MerchantLayout from '@/components/layout/merchant/MerchantLayout'
import AdminLayout from '@/components/layout/admin/AdminLayout'


// Auth
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Merchant
import MerchantDashboardPage from '@/pages/merchant/Dashboard/DashboardPage'
import InvoiceListPage from '@/pages/merchant/Invoice/InvoiceListPage'
import CreateInvoicePage from '@/pages/merchant/Invoice/CreateInvoicePage'
import InvoiceDetailPage from '@/pages/merchant/Invoice/InvoiceDetailPage'
import WalletPage from '@/pages/merchant/Wallet/WalletPage'
import TransactionHistoryPage from '@/pages/merchant/Transaksi/TransactionHistoryPage'
import RefundPage from '@/pages/merchant/Refund/RefundPage'

// Admin
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import PaymentSimulationPage from '@/pages/admin/PaymentSimulationPage'
import RefundManagementPage from '@/pages/admin/RefundManagementPage'
import TopupApprovalPage from '@/pages/admin/TopupApprovalPage'

// Public
import PaymentPage from '@/pages/public/PaymentPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* Public payment page — no auth required */}
        <Route path={ROUTES.PAYMENT_PAGE} element={<PaymentPage />} />

        {/* Unauthorized */}
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* Auth routes — redirect jika sudah login */}
        <Route element={<PublicOnlyRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>

        {/* Merchant routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MERCHANT]} />}>
          <Route element={<MerchantLayout />}>
            <Route path={ROUTES.MERCHANT_DASHBOARD} element={<MerchantDashboardPage />} />
            <Route path={ROUTES.MERCHANT_INVOICES} element={<InvoiceListPage />} />
            <Route path={ROUTES.MERCHANT_INVOICE_CREATE} element={<CreateInvoicePage />} />
            <Route path={ROUTES.MERCHANT_INVOICE_DETAIL} element={<InvoiceDetailPage />} />
            <Route path={ROUTES.MERCHANT_WALLET} element={<WalletPage />} />
            <Route path={ROUTES.MERCHANT_TRANSACTIONS} element={<TransactionHistoryPage />} />
            <Route path={ROUTES.MERCHANT_REFUNDS} element={<RefundPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_PAYMENT_SIMULATION} element={<PaymentSimulationPage />} />
            <Route path={ROUTES.ADMIN_REFUND_MANAGEMENT} element={<RefundManagementPage />} />
            <Route path={ROUTES.ADMIN_TOPUP_APPROVAL} element={<TopupApprovalPage />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

      </Routes>
    </BrowserRouter>
  )
}