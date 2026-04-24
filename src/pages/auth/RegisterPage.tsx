import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormValues } from '@/utils/validations/authSchema'
import { useRegister } from '@/hooks/useRegister'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { ROUTES } from '@/constants/routes'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { handleRegister, isLoading, errorMessage } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = (data: RegisterFormValues) => {
    handleRegister({
      name: data.name,
      email: data.email,
      password: data.password,
    })
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-10">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Payment Sandbox
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Mulai gratis.<br />Tanpa kartu kredit.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
              Daftar sebagai merchant dan langsung bisa buat invoice, simulasi pembayaran, dan kelola refund.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: '01', label: 'Daftar akun merchant' },
              { step: '02', label: 'Buat invoice pertama' },
              { step: '03', label: 'Simulasi pembayaran' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1 shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <p className="text-xs text-slate-500">
            Sandbox environment — tidak ada transaksi nyata
          </p>
        </div>

      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white overflow-y-auto py-10">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Payment Sandbox</span>
        </div>

        <div className="w-full max-w-sm mx-auto">

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">Buat akun merchant</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sudah punya akun?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-blue-600 font-medium hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* API Error */}
          {errorMessage && (
            <div className="mb-5">
              <ErrorMessage message={errorMessage} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nama lengkap
              </label>
              <input
                id="name"
                type="text"
                placeholder="Dindin Mahpudin"
                autoComplete="name"
                className={`
                  w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-150
                  ${errors.name
                    ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }
                `}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="merchant@example.com"
                autoComplete="email"
                className={`
                  w-full px-4 py-2.5 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-150
                  ${errors.email
                    ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }
                `}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className={`
                    w-full px-4 py-2.5 pr-10 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors duration-150
                    ${errors.password
                      ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }
                  `}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Konfirmasi password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  className={`
                    w-full px-4 py-2.5 pr-10 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors duration-150
                    ${errors.confirmPassword
                      ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }
                  `}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2.5 rounded-lg text-sm font-semibold
                bg-blue-600 text-white hover:bg-blue-700
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                active:scale-[0.98] mt-2
              "
            >
              {isLoading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {isLoading ? 'Mendaftar...' : 'Buat akun'}
            </button>

          </form>

          {/* Mobile steps */}
          <div className="mt-8 space-y-2 lg:hidden">
            {[
              { step: '01', label: 'Daftar akun merchant' },
              { step: '02', label: 'Buat invoice pertama' },
              { step: '03', label: 'Simulasi pembayaran' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}