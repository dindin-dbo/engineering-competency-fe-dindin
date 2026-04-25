import api from './axiosInstance'
import { ApiResponse, Invoice, PaymentIntent, PaymentMethod } from '@/types'

export const paymentApi = {
  getInvoiceByToken: (token: string) =>
    api.get<ApiResponse<Invoice>>(`/public/pay/${token}`),

  createPaymentIntent: (token: string, method: PaymentMethod) =>
    api.post<ApiResponse<PaymentIntent>>(`/public/pay/${token}/intents`, { method }),

  getPaymentIntent: (id: string) =>
    api.get<ApiResponse<PaymentIntent>>(`/public/intents/${id}`),
}