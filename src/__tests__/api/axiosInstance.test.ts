import { describe, expect, it } from 'vitest'
import { shouldRedirectOnUnauthorized } from '@/api/axiosInstance'

describe('axiosInstance', () => {
  describe('shouldRedirectOnUnauthorized', () => {
    it('does not redirect auth endpoint 401 responses', () => {
      expect(shouldRedirectOnUnauthorized(401, '/auth/login')).toBe(false)
      expect(shouldRedirectOnUnauthorized(401, '/auth/register')).toBe(false)
      expect(shouldRedirectOnUnauthorized(401, '/api/v1/auth/login')).toBe(false)
      expect(shouldRedirectOnUnauthorized(401, '/api/v1/auth/register?invite=abc')).toBe(false)
    })

    it('redirects protected endpoint 401 responses', () => {
      expect(shouldRedirectOnUnauthorized(401, '/me')).toBe(true)
      expect(shouldRedirectOnUnauthorized(401, '/invoices')).toBe(true)
    })

    it('does not redirect non-401 responses', () => {
      expect(shouldRedirectOnUnauthorized(400, '/me')).toBe(false)
      expect(shouldRedirectOnUnauthorized(500, '/invoices')).toBe(false)
      expect(shouldRedirectOnUnauthorized(undefined, '/me')).toBe(false)
    })
  })
})
