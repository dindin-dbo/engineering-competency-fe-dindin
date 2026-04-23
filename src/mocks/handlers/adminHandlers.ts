import { http, HttpResponse } from 'msw'
import {
  mockPaymentIntents,
  mockInvoices,
  mockRefunds,
  mockTopups,
  mockWallet,
} from '@/mocks/data/invoices'

export const adminHandlers = [
  // Payment intents
  http.get('/api/v1/admin/payment-intents', () => {
    return HttpResponse.json({ data: mockPaymentIntents })
  }),

  http.patch('/api/v1/admin/payment-intents/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: 'SUCCESS' | 'FAILED' }
    const intent = mockPaymentIntents.find(pi => pi.id === params.id)

    if (!intent) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment intent not found' } },
        { status: 404 }
      )
    }

    intent.status = body.status

    if (body.status === 'SUCCESS') {
      const invoice = mockInvoices.find(inv => inv.id === intent.invoice_id)
      if (invoice) invoice.status = 'PAID'
    }

    return HttpResponse.json({ data: intent })
  }),

  // Balance requests
  http.get('/api/v1/admin/balance-requests', () => {
    return HttpResponse.json({ data: mockTopups })
  }),

  http.patch('/api/v1/admin/balance-requests/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: 'SUCCESS' | 'FAILED' }
    const topup = mockTopups.find(t => t.id === params.id)

    if (!topup) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Balance request not found' } },
        { status: 404 }
      )
    }

    topup.status = body.status
    if (body.status === 'SUCCESS') mockWallet.balance += topup.amount

    return HttpResponse.json({ data: topup })
  }),

  // Refunds
  http.get('/api/v1/admin/refunds', () => {
    return HttpResponse.json({ data: mockRefunds })
  }),

  http.patch('/api/v1/admin/refunds/:id/decision', async ({ params, request }) => {
    const body = await request.json() as { status: 'APPROVED' | 'REJECTED' }
    const refund = mockRefunds.find(r => r.id === params.id)

    if (!refund) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Refund not found' } },
        { status: 404 }
      )
    }

    refund.status = body.status
    return HttpResponse.json({ data: refund })
  }),

  http.patch('/api/v1/admin/refunds/:id/process', async ({ params, request }) => {
    const body = await request.json() as { status: 'SUCCESS' | 'FAILED' }
    const refund = mockRefunds.find(r => r.id === params.id)

    if (!refund) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Refund not found' } },
        { status: 404 }
      )
    }

    refund.status = body.status
    if (body.status === 'SUCCESS') mockWallet.balance -= refund.amount

    return HttpResponse.json({ data: refund })
  }),

  // Stats
  http.get('/api/v1/admin/stats', () => {
    const paid = mockInvoices.filter(inv => inv.status === 'PAID')
    const failed = mockPaymentIntents.filter(pi => pi.status === 'FAILED')
    const expired = mockInvoices.filter(inv => inv.status === 'EXPIRED')
    const successRefunds = mockRefunds.filter(r => r.status === 'SUCCESS')

    return HttpResponse.json({
      data: {
        total_invoices: mockInvoices.length,
        total_paid: paid.length,
        total_failed: failed.length,
        total_expired: expired.length,
        total_transaction_amount: paid.reduce((sum, inv) => sum + inv.amount, 0),
        total_refund_amount: successRefunds.reduce((sum, r) => sum + r.amount, 0),
      },
    })
  }),
]