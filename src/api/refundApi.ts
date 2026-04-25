import api from './axiosInstance'
import { ApiResponse, Refund } from '@/types'

export interface CreateRefundPayload {
  invoice_id: string
  reason: string
}

export const refundApi = {
  createRefund: (payload: CreateRefundPayload) =>
    api.post<ApiResponse<Refund>>('/refunds', payload),

  getRefunds: () =>
    api.get<ApiResponse<Refund[]>>('/refunds'),
}