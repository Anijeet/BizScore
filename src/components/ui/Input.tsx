import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, optional = false, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-navy-800"
          >
            {label}
            {optional && (
              <span className="ml-1.5 text-xs font-normal text-navy-400">
                Optional
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2.5 text-sm rounded border font-body
            bg-white text-navy-900 placeholder:text-navy-300
            border-surface-200 
            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500
            disabled:bg-surface-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-navy-400">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-navy-800">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2.5 text-sm rounded border font-body
          bg-white text-navy-900
          border-surface-200
          focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500
          disabled:bg-surface-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-red-400 focus:ring-red-400' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
