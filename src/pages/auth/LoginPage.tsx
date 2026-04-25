import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormValues } from '@/utils/validations/authSchema'
import { useLogin } from '@/hooks/auth/useLogin'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { handleLogin, isLoading, errorMessage } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

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
              Simulate.<br />Test.<br />Ship.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
              Platform simulasi pembayaran untuk developer. Tanpa integrasi pihak ketiga, tanpa biaya.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Invoice management', 'Payment simulation', 'Refund flow', 'Admin dashboard'].map((f) => (
              <span
                key={f}
                className="text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-full px-3 py-1"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — demo credentials */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Demo credentials
          </p>
          <div className="space-y-1.5">
            {[
              { role: 'Merchant', email: 'merchant@test.com', password: 'password123' },
              { role: 'Admin', email: 'admin@test.com', password: 'password123' },
            ].map((cred) => (
              <div key={cred.role} className="flex items-center gap-2">
                <span className={`
                  text-xs font-medium px-2 py-0.5 rounded-md
                  ${cred.role === 'Admin'
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-blue-500/20 text-blue-400'
                  }
                `}>
                  {cred.role}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {cred.email} / {cred.password}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white">

        {/* Mobile logo — only visible below lg */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Masuk ke akun</h2>
            <p className="text-sm text-gray-500 mt-1">
              Belum punya akun?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-blue-600 font-medium hover:underline"
              >
                Daftar sekarang
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
          <form onSubmit={handleSubmit(handleLogin)} noValidate className="space-y-5">

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="merchant@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Masukkan password"
                autoComplete="current-password"
                error={errors.password?.message}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
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

            <Button type="submit" fullWidth isLoading={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>

          </form>

          {/* Mobile demo credentials */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl lg:hidden">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Demo credentials
            </p>
            <div className="space-y-1.5">
              {[
                { role: 'Merchant', email: 'merchant@test.com', password: 'password123' },
                { role: 'Admin', email: 'admin@test.com', password: 'password123' },
              ].map((cred) => (
                <div key={cred.role} className="flex items-center gap-2 flex-wrap">
                  <span className={`
                    text-xs font-medium px-2 py-0.5 rounded-md
                    ${cred.role === 'Admin'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-blue-100 text-blue-700'
                    }
                  `}>
                    {cred.role}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {cred.email} / {cred.password}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}