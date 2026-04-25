import { describe, it, expect } from 'vitest'
import { topupSchema } from '@/utils/validations/walletSchema'

describe('topupSchema', () => {
  it('passes with valid amount', () => {
    expect(topupSchema.safeParse({ amount: 100000 }).success).toBe(true)
  })

  it('fails when amount is below minimum', () => {
    const result = topupSchema.safeParse({ amount: 5000 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.amount).toBeDefined()
    }
  })

  it('fails when amount is above maximum', () => {
    const result = topupSchema.safeParse({ amount: 20000000 })
    expect(result.success).toBe(false)
  })

  it('fails when amount is zero', () => {
    expect(topupSchema.safeParse({ amount: 0 }).success).toBe(false)
  })

  it('fails when amount is negative', () => {
    expect(topupSchema.safeParse({ amount: -1000 }).success).toBe(false)
  })

  it('passes with minimum valid amount', () => {
    expect(topupSchema.safeParse({ amount: 10000 }).success).toBe(true)
  })

  it('passes with maximum valid amount', () => {
    expect(topupSchema.safeParse({ amount: 10000000 }).success).toBe(true)
  })

  it('fails when amount is not a number', () => {
    expect(topupSchema.safeParse({ amount: 'bukan angka' }).success).toBe(false)
  })
})