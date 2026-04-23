import { http, HttpResponse } from 'msw'
import { mockWallet, mockTopups } from '@/mocks/data/invoices'

export const walletHandlers = [
  http.get('/api/v1/wallet', () => {
    return HttpResponse.json({ data: mockWallet })
  }),

  http.post('/api/v1/balance-requests', async ({ request }) => {
    const body = await request.json() as { amount: number }

    const newTopup = {
      id: `topup-${Date.now()}`,
      merchant_id: 'user-1',
      merchant_name: 'Budi Merchant',
      amount: body.amount,
      status: 'PENDING' as const,
      created_at: new Date().toISOString(),
    }

    mockTopups.push(newTopup)
    return HttpResponse.json({ data: newTopup }, { status: 201 })
  }),

  http.get('/api/v1/balance-requests', () => {
    return HttpResponse.json({ data: mockTopups })
  }),
]