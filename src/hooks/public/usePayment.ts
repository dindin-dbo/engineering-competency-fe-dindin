import { useEffect, useState, useRef } from 'react'
import { paymentApi } from '@/api/paymentApi'
import { Invoice, PaymentIntent, PaymentMethod } from '@/types'

export function usePayment(token: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch invoice by token
  useEffect(() => {
    if (!token) return

    const fetchInvoice = async () => {
      setIsLoadingInvoice(true)
      setError(null)
      try {
        const res = await paymentApi.getInvoiceByToken(token)
        setInvoice(res.data.data)
      } catch {
        setError('Link pembayaran tidak valid atau sudah kedaluwarsa.')
      } finally {
        setIsLoadingInvoice(false)
      }
    }

    fetchInvoice()
  }, [token])

  // Polling payment intent status
  useEffect(() => {
    if (!paymentIntent || paymentIntent.status !== 'PENDING') {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentApi.getPaymentIntent(paymentIntent.id)
        const updated = res.data.data

        setPaymentIntent(updated)

        if (updated.status === 'SUCCESS') {
          setInvoice((prev) => prev ? { ...prev, status: 'PAID' } : prev)
          if (pollingRef.current) clearInterval(pollingRef.current)
        }

        if (updated.status === 'FAILED') {
          if (pollingRef.current) clearInterval(pollingRef.current)
        }
      } catch {
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [paymentIntent])

  const handlePay = async () => {
    if (!selectedMethod || !token) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await paymentApi.createPaymentIntent(token, selectedMethod)
      setPaymentIntent(res.data.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } }
      setError(e.response?.data?.error?.message ?? 'Gagal membuat pembayaran.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    invoice,
    paymentIntent,
    isLoadingInvoice,
    isSubmitting,
    error,
    selectedMethod,
    setSelectedMethod,
    handlePay,
  }
}