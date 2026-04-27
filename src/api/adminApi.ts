import api from './axiosInstance'
import { ApiResponse, PaymentIntent, TopupRequest, Refund, AdminStats } from '@/types'

export const adminApi = {
  // Payment intents
  getPaymentIntents: () =>
    api.get<ApiResponse<PaymentIntent[]>>('/admin/payment-intents'),

  updatePaymentIntentStatus: (id: string, status: 'SUCCESS' | 'FAILED') =>
    api.patch<ApiResponse<PaymentIntent>>(`/admin/payment-intents/${id}/status`, { status }),

  // Balance requests
  getBalanceRequests: () =>
    api.get<ApiResponse<TopupRequest[]>>('/admin/balance-requests'),

  updateBalanceRequestStatus: (id: string, status: 'SUCCESS' | 'FAILED') =>
    api.patch<ApiResponse<TopupRequest>>(`/admin/balance-requests/${id}/status`, { status }),

  // Refunds
  getRefunds: () =>
    api.get<ApiResponse<Refund[]>>('/admin/refunds'),

  updateRefundDecision: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch<ApiResponse<Refund>>(`/admin/refunds/${id}/decision`, { status }),

  processRefund: (id: string, status: 'SUCCESS' | 'FAILED') =>
    api.patch<ApiResponse<Refund>>(`/admin/refunds/${id}/process`, { status }),

  // Stats
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats'),
}