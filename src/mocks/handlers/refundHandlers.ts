import { http, HttpResponse } from 'msw'
import { mockRefunds, mockInvoices } from '@/mocks/data/invoices'

export const refundHandlers = [
  http.post('/api/v1/refunds', async ({ request }) => {
    const body = await request.json() as { invoice_id: string; reason: string }
    const invoice = mockInvoices.find(inv => inv.id === body.invoice_id)

    if (!invoice) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      )
    }

    const newRefund = {
      id: `refund-${Date.now()}`,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      merchant_id: 'user-1',
      merchant_name: 'Dindin Merchant',
      amount: invoice.amount,
      reason: body.reason,
      status: 'REQUESTED' as const,
      created_at: new Date().toISOString(),
    }

    mockRefunds.push(newRefund)
    return HttpResponse.json({ data: newRefund }, { status: 201 })
  }),

  http.get('/api/v1/refunds', () => {
    return HttpResponse.json({ data: mockRefunds })
  }),
]