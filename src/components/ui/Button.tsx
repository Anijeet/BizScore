import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-body font-medium rounded transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-600 active:bg-navy-900',
      secondary:
        'bg-surface-100 text-navy-800 border border-surface-200 hover:bg-surface-200 focus-visible:ring-navy-400',
      ghost:
        'text-navy-700 hover:bg-surface-100 focus-visible:ring-navy-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    }

    const sizes = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
