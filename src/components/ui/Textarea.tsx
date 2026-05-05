import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-lg border text-sm bg-white
            resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-150
            hover:border-gray-400
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 text-red-900 placeholder-red-300 focus:ring-red-400'
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea