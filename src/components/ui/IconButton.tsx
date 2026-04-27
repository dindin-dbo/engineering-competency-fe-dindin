import { ButtonHTMLAttributes, useState } from 'react'

type IconButtonVariant = 'success' | 'danger' | 'info' | 'warning' | 'neutral'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  tooltip: string
  variant?: IconButtonVariant
  size?: 'sm' | 'md'
}

const variantStyles: Record<IconButtonVariant, string> = {
  success: 'text-green-600 hover:bg-green-50 hover:border-green-200 border-transparent',
  danger: 'text-red-500 hover:bg-red-50 hover:border-red-200 border-transparent',
  info: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200 border-transparent',
  warning: 'text-amber-600 hover:bg-amber-50 hover:border-amber-200 border-transparent',
  neutral: 'text-gray-500 hover:bg-gray-100 hover:border-gray-200 border-transparent',
}

const sizeStyles = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
}

export default function IconButton({
  icon,
  tooltip,
  variant = 'neutral',
  size = 'md',
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-flex">
      <button
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={tooltip}
        className={`
          ${sizeStyles[size]} rounded-lg border
          flex items-center justify-center
          transition-all duration-150
          disabled:opacity-40 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {icon}
      </button>

      {/* Tooltip */}
      {showTooltip && !disabled && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap
          bg-gray-900 text-white pointer-events-none z-50
        ">
          {tooltip}
          {/* Arrow */}
          <div className="
            absolute top-full left-1/2 -translate-x-1/2
            border-4 border-transparent border-t-gray-900
          " />
        </div>
      )}
    </div>
  )
}