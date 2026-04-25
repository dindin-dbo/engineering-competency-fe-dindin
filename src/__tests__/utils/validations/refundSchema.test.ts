import { describe, it, expect } from 'vitest'
import { refundSchema } from '@/utils/validations/refundSchema'

const validPayload = {
  invoice_id: 'inv-1',
  reason: 'Produk tidak sesuai dengan deskripsi yang tertera',
}

describe('refundSchema', () => {
  it('passes with valid payload', () => {
    expect(refundSchema.safeParse(validPayload).success).toBe(true)
  })

  it('fails when invoice_id is empty', () => {
    const result = refundSchema.safeParse({ ...validPayload, invoice_id: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.invoice_id).toBeDefined()
    }
  })

  it('fails when reason is empty', () => {
    const result = refundSchema.safeParse({ ...validPayload, reason: '' })
    expect(result.success).toBe(false)
  })

  it('fails when reason is too short', () => {
    const result = refundSchema.safeParse({ ...validPayload, reason: 'Salah' })
    expect(result.success).toBe(false)
  })

  it('passes when reason is exactly 10 characters', () => {
    const result = refundSchema.safeParse({ ...validPayload, reason: '1234567890' })
    expect(result.success).toBe(true)
  })

  it('fails when reason is 9 characters', () => {
    const result = refundSchema.safeParse({ ...validPayload, reason: '123456789' })
    expect(result.success).toBe(false)
  })
})