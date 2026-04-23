import { http, HttpResponse } from 'msw'
import { mockInvoices } from '@/mocks/data/invoices'
import { Invoice } from '@/types'

export const invoiceHandlers = [
  http.get('/api/v1/invoices', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)
    const status = url.searchParams.get('status')

    let filtered = [...mockInvoices]
    if (status) filtered = filtered.filter(inv => inv.status === status)

    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: {
        page,
        limit,
        total_items: filtered.length,
        total_pages: Math.ceil(filtered.length / limit),
      },
    })
  }),

  http.get('/api/v1/invoices/:id', ({ params }) => {
    const invoice = mockInvoices.find(inv => inv.id === params.id)

    if (!invoice) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: invoice })
  }),

  http.post('/api/v1/invoices', async ({ request }) => {
    const body = await request.json() as Partial<Invoice>

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      merchant_id: 'user-1',
      invoice_number: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(mockInvoices.length + 1).padStart(4, '0')}`,
      customer_name: body.customer_name ?? '',
      customer_email: body.customer_email ?? '',
      amount: body.amount ?? 0,
      description: body.description ?? '',
      due_date: body.due_date ?? '',
      status: 'PENDING',
      payment_link_token: `token-${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
    }

    mockInvoices.push(newInvoice)
    return HttpResponse.json({ data: newInvoice }, { status: 201 })
  }),

  http.get('/api/v1/public/pay/:token', ({ params }) => {
    const invoice = mockInvoices.find(inv => inv.payment_link_token === params.token)

    if (!invoice) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment link not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: invoice })
  }),
]