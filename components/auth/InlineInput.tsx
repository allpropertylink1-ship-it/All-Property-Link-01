"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  labelWidth?: string
}

export const InlineInput = forwardRef<HTMLInputElement, InlineInputProps>(
  (
    {
      label,
      required = false,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      labelWidth = "sm:max-w-[140px]",
      className,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <label
          htmlFor={inputId}
          className={cn(
            "shrink-0 text-xs font-semibold text-text-primary",
            labelWidth,
            required && "text-error-500",
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>}
        </label>
        <div className="relative flex-1 min-w-0">
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "block w-full rounded-lg border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500/30",
              "stitch-input",
            )}
            style={{ fontSize: "16px", ...style }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {trailingIcon}
            </div>
          )}
          {error && (
            <p id={`${inputId}-error`} className="mt-1 text-xs text-error-500" role="alert">
              {error}
            </p>
          )}
          {hint && !error && (
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-text-secondary">
              {hint}
            </p>
          )}
        </div>
      </div>
    )
  },
)

InlineInput.displayName = "InlineInput"