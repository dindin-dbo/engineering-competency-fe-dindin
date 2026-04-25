import { createInvoiceSchema } from '@/utils/validations/invoiceSchema'

const validPayload = {
  customer_name: 'Andi Santoso',
  customer_email: 'andi@test.com',
  amount: 100000,
  description: 'Pembelian produk A',
  due_date: '2099-12-31',
}

describe('createInvoiceSchema', () => {
  it('passes with valid payload', () => {
    expect(createInvoiceSchema.safeParse(validPayload).success).toBe(true)
  })

  it('fails when customer_name is empty', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, customer_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.customer_name).toBeDefined()
    }
  })

  it('fails when customer_name is too short', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, customer_name: 'Ab' })
    expect(result.success).toBe(false)
  })

  it('fails when customer_email is invalid', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, customer_email: 'bukan-email' })
    expect(result.success).toBe(false)
  })

  it('fails when amount is 0', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('fails when amount is negative', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, amount: -1000 })
    expect(result.success).toBe(false)
  })

  it('fails when description is empty', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, description: '' })
    expect(result.success).toBe(false)
  })

  it('fails when due_date is empty', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, due_date: '' })
    expect(result.success).toBe(false)
  })

  it('fails when due_date is in the past', () => {
    const result = createInvoiceSchema.safeParse({ ...validPayload, due_date: '2020-01-01' })
    expect(result.success).toBe(false)
  })

  it('passes when due_date is today', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = createInvoiceSchema.safeParse({ ...validPayload, due_date: today })
    expect(result.success).toBe(true)
  })
})