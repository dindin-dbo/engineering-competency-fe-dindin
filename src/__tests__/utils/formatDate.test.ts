import { describe, it, expect } from 'vitest'
import { formatDate } from '@/utils/formatDate'

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2025-04-01')
    expect(result).toContain('2025')
    expect(result).toContain('1')
  })

  it('returns a non-empty string', () => {
    expect(formatDate('2025-01-15')).toBeTruthy()
  })

  it('formats different months correctly', () => {
    const jan = formatDate('2025-01-01')
    const dec = formatDate('2025-12-01')
    expect(jan).not.toBe(dec)
  })
})