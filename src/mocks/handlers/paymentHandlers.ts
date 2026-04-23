import { http, HttpResponse } from 'msw'
import { mockPaymentIntents, mockInvoices } from '@/mocks/data/invoices'
import { PaymentMethod } from '@/types'

export const paymentHandlers = [
  http.post('/api/v1/public/pay/:token/intents', async ({ params, request }) => {
    const body = await request.json() as { method: PaymentMethod }
    const invoice = mockInvoices.find(inv => inv.payment_link_token === params.token)

    if (!invoice) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      )
    }

    const newIntent = {
      id: `pi-${Date.now()}`,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      merchant_name: 'Budi Merchant',
      method: body.method,
      status: 'PENDING' as const,
      created_at: new Date().toISOString(),
    }

    mockPaymentIntents.push(newIntent)
    return HttpResponse.json({ data: newIntent }, { status: 201 })
  }),

  http.get('/api/v1/public/intents/:id', ({ params }) => {
    const intent = mockPaymentIntents.find(pi => pi.id === params.id)

    if (!intent) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment intent not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: intent })
  }),
]