import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/utils/formatCurrency'

describe('formatCurrency', () => {
  it('formats regular amount', () => {
    const result = formatCurrency(100000)
    expect(result).toMatch(/Rp/)
    expect(result).toMatch(/100/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/Rp/)
    expect(result).toMatch(/0/)
  })

  it('formats large amount', () => {
    const result = formatCurrency(1500000)
    expect(result).toMatch(/Rp/)
    expect(result).toMatch(/1/)
    expect(result).toMatch(/500/)
  })

  it('formats small amount', () => {
    const result = formatCurrency(5000)
    expect(result).toMatch(/Rp/)
    expect(result).toMatch(/5/)
  })

  it('starts with Rp prefix', () => {
    expect(formatCurrency(50000)).toMatch(/^Rp/)
  })

  it('returns higher value for larger amount', () => {
    const small = formatCurrency(1000)
    const large = formatCurrency(1000000)
    expect(large.length).toBeGreaterThanOrEqual(small.length)
  })
})