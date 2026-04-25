import { z } from 'zod'

export const refundSchema = z.object({
  invoice_id: z
    .string()
    .min(1, 'Invoice wajib dipilih'),
  reason: z
    .string()
    .min(1, 'Alasan refund wajib diisi')
    .min(10, 'Alasan minimal 10 karakter'),
})

export type RefundFormValues = z.infer<typeof refundSchema>