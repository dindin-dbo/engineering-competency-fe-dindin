import { forwardRef, useCallback, useEffect, useState } from 'react'

interface CurrencyInputProps {
  id?: string
  label?: string
  error?: string
  value?: number
  onChange?: (value: number) => void
  onBlur?: () => void
  placeholder?: string
  min?: number
  disabled?: boolean
}

function formatDisplay(value: number): string {
  if (!value || isNaN(value)) return ''
  return new Intl.NumberFormat('id-ID').format(value)
}

function parseRaw(display: string): number {
  const digits = display.replace(/\./g, '').replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, label, error, value, onChange, onBlur, placeholder = '0', min, disabled }, ref) => {
    const [display, setDisplay] = useState<string>(
      value ? formatDisplay(value) : ''
    )

    useEffect(() => {
      if (value === undefined) return
    
      const formatted = value ? formatDisplay(value) : ''
    
      setDisplay((prev) => {
        return prev === formatted ? prev : formatted
      })
    }, [value])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value

        // Hanya izinkan angka dan titik (titik di sini adalah separator format)
        const digitsOnly = raw.replace(/\./g, '').replace(/[^\d]/g, '')

        if (digitsOnly === '') {
          setDisplay('')
          onChange?.(0)
          return
        }

        const numeric = parseInt(digitsOnly, 10)
        setDisplay(formatDisplay(numeric))
        onChange?.(numeric)
      },
      [onChange]
    )

    const handleBlur = useCallback(() => {
      // Reformat saat blur untuk memastikan konsisten
      const numeric = parseRaw(display)
      setDisplay(numeric ? formatDisplay(numeric) : '')
      onBlur?.()
    }, [display, onBlur])

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
            Rp
          </span>
          <input
            ref={ref}
            id={id}
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            min={min}
            disabled={disabled}
            className={`
              w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-colors duration-150
              ${error
                ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }
            `}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
export default CurrencyInput