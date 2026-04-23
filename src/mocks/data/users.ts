import { User } from '@/types'

interface MockUser extends User {
  password: string
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    name: 'Budi Merchant',
    email: 'merchant@test.com',
    password: 'password123',
    role: 'MERCHANT' as const,
  },
  {
    id: 'user-2',
    name: 'Admin Sandbox',
    email: 'admin@test.com',
    password: 'password123',
    role: 'ADMIN' as const,
  },
]

export const mockTokens: Record<string, string> = {
  'user-1': 'mock-jwt-token-merchant',
  'user-2': 'mock-jwt-token-admin',
}