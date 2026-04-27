import Modal from './Modal'

type ConfirmVariant = 'success' | 'danger' | 'warning' | 'info'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  isLoading?: boolean
}

const variantStyles: Record<ConfirmVariant, {
  icon: React.ReactNode
  iconBg: string
  confirmBtn: string
}> = {
  success: {
    iconBg: 'bg-green-50',
    confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  danger: {
    iconBg: 'bg-red-50',
    confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  warning: {
    iconBg: 'bg-amber-50',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    iconBg: 'bg-blue-50',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  const styles = variantStyles[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">

        {/* Icon + description */}
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-xl ${styles.iconBg}
            flex items-center justify-center shrink-0
          `}>
            {styles.icon}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pt-1">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              px-4 py-2.5 rounded-lg text-sm font-medium
              border border-gray-300 text-gray-700
              hover:bg-gray-50 disabled:opacity-50
              transition-colors
            "
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2.5 rounded-lg text-sm font-medium text-white
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2 transition-colors
              ${styles.confirmBtn}
            `}
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>

      </div>
    </Modal>
  )
}