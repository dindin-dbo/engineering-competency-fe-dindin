/* eslint-disable prefer-const */
import { Invoice, PaymentIntent, Refund, TopupRequest, Wallet } from '@/types'

export let mockWallet: Wallet = {
  id: 'wallet-1',
  merchant_id: 'user-1',
  balance: 500000,
}

export let mockTopups: TopupRequest[] = [
  {
    id: 'topup-1',
    merchant_id: 'user-1',
    merchant_name: 'Dindin Merchant',
    amount: 200000,
    status: 'PENDING',
    created_at: '2025-04-01T10:00:00Z',
  },
  {
    id: 'topup-2',
    merchant_id: 'user-1',
    merchant_name: 'Dindin Merchant',
    amount: 150000,
    status: 'SUCCESS',
    created_at: '2025-04-10T10:00:00Z',
  },
]

export let mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    merchant_id: 'user-1',
    invoice_number: 'INV-20250401-0001',
    customer_name: 'Andi Pelanggan',
    customer_email: 'andi@example.com',
    amount: 150000,
    description: 'Pembelian produk A',
    due_date: '2025-05-01',
    status: 'PENDING',
    payment_link_token: 'token-abc-123',
    created_at: '2025-04-01T09:00:00Z',
  },
  {
    id: 'inv-2',
    merchant_id: 'user-1',
    invoice_number: 'INV-20250402-0002',
    customer_name: 'Siti Pembeli',
    customer_email: 'siti@example.com',
    amount: 300000,
    description: 'Pembelian produk B',
    due_date: '2025-04-10',
    status: 'PAID',
    payment_link_token: 'token-def-456',
    created_at: '2025-04-02T10:00:00Z',
  },
  {
    id: 'inv-3',
    merchant_id: 'user-1',
    invoice_number: 'INV-20250403-0003',
    customer_name: 'Rudi Konsumen',
    customer_email: 'rudi@example.com',
    amount: 75000,
    description: 'Pembelian produk C',
    due_date: '2025-03-01',
    status: 'EXPIRED',
    payment_link_token: 'token-ghi-789',
    created_at: '2025-04-03T11:00:00Z',
  },
]

export let mockPaymentIntents: PaymentIntent[] = [
  {
    id: 'pi-1',
    invoice_id: 'inv-1',
    invoice_number: 'INV-20250401-0001',
    merchant_name: 'Dindin Merchant',
    method: 'WALLET',
    status: 'PENDING',
    created_at: '2025-04-01T09:30:00Z',
  },
]

export let mockRefunds: Refund[] = [
  {
    id: 'refund-1',
    invoice_id: 'inv-2',
    invoice_number: 'INV-20250402-0002',
    merchant_id: 'user-1',
    merchant_name: 'Dindin Merchant',
    amount: 300000,
    reason: 'Produk tidak sesuai',
    status: 'REQUESTED',
    created_at: '2025-04-05T08:00:00Z',
  },
]