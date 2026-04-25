import { z } from 'zod'

export const createInvoiceSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Nama customer wajib diisi')
    .min(3, 'Nama customer minimal 3 karakter'),
  customer_email: z
    .string()
    .min(1, 'Email customer wajib diisi')
    .email('Format email tidak valid'),
  amount: z
    .number({ message: 'Jumlah harus berupa angka' })
    .min(1, 'Jumlah harus lebih dari 0'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi'),
  due_date: z
    .string()
    .min(1, 'Due date wajib diisi')
    .refine((val) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(val) >= today
    }, 'Due date tidak boleh sebelum hari ini'),
})

export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>