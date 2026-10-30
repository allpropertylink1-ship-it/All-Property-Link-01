"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      required = false,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      className,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className={cn("space-y-1.5", className)}>
        <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
          {label}
          {required && <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>}
        </label>
        <div className="relative">
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none shrink-0">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "block w-full rounded-lg border bg-surface-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors",
              leadingIcon && "pl-11",
              trailingIcon && "pr-11",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500/30",
            )}
            style={{ fontSize: "16px", ...style }}
            aria-invalid={!!error}
            aria-required={required}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted shrink-0">
              {trailingIcon}
            </div>
          )}
          {error && (
            <p id={`${inputId}-error`} className="mt-1 text-xs text-error-500" role="alert">
              {error}
            </p>
          )}
          {hint && !error && (
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-text-muted">
              {hint}
            </p>
          )}
        </div>
      </div>
    )
  },
)

AuthInput.displayName = "AuthInput"
