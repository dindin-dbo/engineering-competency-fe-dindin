import api from './axiosInstance'
import { ApiResponse, AuthResponse, User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  me: () =>
    api.get<ApiResponse<User>>('/me'),
}