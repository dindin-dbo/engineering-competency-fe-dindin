export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Merchant
  MERCHANT_DASHBOARD: '/merchant/dashboard',
  MERCHANT_INVOICES: '/merchant/invoices',
  MERCHANT_INVOICE_CREATE: '/merchant/invoices/create',
  MERCHANT_INVOICE_DETAIL: '/merchant/invoices/:id',
  MERCHANT_WALLET: '/merchant/wallet',
  MERCHANT_TRANSACTIONS: '/merchant/transactions',
  MERCHANT_REFUNDS: '/merchant/refunds',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PAYMENT_SIMULATION: '/admin/payment-simulation',
  ADMIN_REFUND_MANAGEMENT: '/admin/refunds',
  ADMIN_TOPUP_APPROVAL: '/admin/topup',

  // Public
  PAYMENT_PAGE: '/pay/:token',

  // Misc
  UNAUTHORIZED: '/unauthorized',
} as const