import api from './axiosInstance'
import { ApiResponse, Invoice } from '@/types'

interface GetInvoicesParams {
  page?: number
  limit?: number
  status?: string
}

export const invoiceApi = {
  getInvoices: (params?: GetInvoicesParams) =>
    api.get<{ data: Invoice[]; meta: any }>('/invoices', { params }),

  getInvoiceById: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/invoices/${id}`),

  createInvoice: (payload: Omit<Invoice, 'id' | 'merchant_id' | 'invoice_number' | 'status' | 'payment_link_token' | 'created_at'>) =>
    api.post<ApiResponse<Invoice>>('/invoices', payload),
}