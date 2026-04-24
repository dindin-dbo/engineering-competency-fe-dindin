import { describe, it, expect } from 'vitest'
import { getStatusVariant, getStatusLabel } from '@/utils/getStatusBadge'

describe('getStatusVariant', () => {
  it('returns success for PAID', () => {
    expect(getStatusVariant('PAID')).toBe('success')
  })

  it('returns success for SUCCESS', () => {
    expect(getStatusVariant('SUCCESS')).toBe('success')
  })

  it('returns success for APPROVED', () => {
    expect(getStatusVariant('APPROVED')).toBe('success')
  })

  it('returns warning for PENDING', () => {
    expect(getStatusVariant('PENDING')).toBe('warning')
  })

  it('returns warning for REQUESTED', () => {
    expect(getStatusVariant('REQUESTED')).toBe('warning')
  })

  it('returns danger for FAILED', () => {
    expect(getStatusVariant('FAILED')).toBe('danger')
  })

  it('returns danger for REJECTED', () => {
    expect(getStatusVariant('REJECTED')).toBe('danger')
  })

  it('returns danger for EXPIRED', () => {
    expect(getStatusVariant('EXPIRED')).toBe('danger')
  })
})

describe('getStatusLabel', () => {
  it('returns label for PAID', () => {
    expect(getStatusLabel('PAID')).toBe('Lunas')
  })

  it('returns label for PENDING', () => {
    expect(getStatusLabel('PENDING')).toBe('Pending')
  })

  it('returns label for EXPIRED', () => {
    expect(getStatusLabel('EXPIRED')).toBe('Kedaluwarsa')
  })

  it('returns label for SUCCESS', () => {
    expect(getStatusLabel('SUCCESS')).toBe('Berhasil')
  })

  it('returns label for FAILED', () => {
    expect(getStatusLabel('FAILED')).toBe('Gagal')
  })

  it('returns label for REQUESTED', () => {
    expect(getStatusLabel('REQUESTED')).toBe('Diajukan')
  })

  it('returns label for APPROVED', () => {
    expect(getStatusLabel('APPROVED')).toBe('Disetujui')
  })

  it('returns label for REJECTED', () => {
    expect(getStatusLabel('REJECTED')).toBe('Ditolak')
  })

  it('returns raw status when label not found', () => {
    expect(getStatusLabel('UNKNOWN' as any)).toBe('UNKNOWN')
  })
})