import api from './axiosInstance'
import { ApiResponse, Wallet, TopupRequest } from '@/types'

export const walletApi = {
  getWallet: () =>
    api.get<ApiResponse<Wallet>>('/wallet'),

  requestTopup: (amount: number) =>
    api.post<ApiResponse<TopupRequest>>('/balance-requests', { amount }),

  getTopupHistory: () =>
    api.get<ApiResponse<TopupRequest[]>>('/balance-requests'),
}