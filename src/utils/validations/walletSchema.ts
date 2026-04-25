import { z } from 'zod'

export const topupSchema = z.object({
  amount: z
    .number({ message: 'Jumlah harus berupa angka' })
    .min(10000, 'Minimal top-up Rp 10.000')
    .max(10000000, 'Maksimal top-up Rp 10.000.000'),
})

export type TopupFormValues = z.infer<typeof topupSchema>