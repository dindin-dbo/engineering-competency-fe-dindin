export type Role = 'MERCHANT' | 'ADMIN'

export type InvoiceStatus = 'PENDING' | 'PAID' | 'EXPIRED'

export type PaymentMethod = 'WALLET' | 'VA_DUMMY' | 'EWALLET_DUMMY'

export type PaymentIntentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type TopupStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'FAILED'

// Auth
export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthResponse {
  data: {
    token: string
    user: User
  }
}

// Wallet
export interface Wallet {
  id: string
  merchant_id: string
  balance: number
}

export interface TopupRequest {
  id: string
  merchant_id: string
  merchant_name: string
  amount: number
  status: TopupStatus
  created_at: string
}

// Invoice
export interface Invoice {
  id: string
  merchant_id: string
  invoice_number: string
  customer_name: string
  customer_email: string
  amount: number
  description: string
  due_date: string
  status: InvoiceStatus
  payment_link_token: string
  created_at: string
}

// Payment
export interface PaymentIntent {
  id: string
  invoice_id: string
  invoice_number: string
  merchant_name: string
  method: PaymentMethod
  status: PaymentIntentStatus
  created_at: string
}

// Refund
export interface Refund {
  id: string
  invoice_id: string
  invoice_number: string
  merchant_id: string
  merchant_name: string
  amount: number
  reason: string
  status: RefundStatus
  created_at: string
}

// Admin stats
export interface AdminStats {
  total_invoices: number
  total_paid: number
  total_failed: number
  total_expired: number
  total_transaction_amount: number
  total_refund_amount: number
}

// API standard response
export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}