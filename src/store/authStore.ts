import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: 'MERCHANT' | 'ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  role: 'MERCHANT' | 'ADMIN' | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  role: (localStorage.getItem('role') as 'MERCHANT' | 'ADMIN') || null,

  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', user.role)
    set({ user, token, role: user.role })
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, token: null, role: null })
  },
}))