"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Check } from "@/components/ui/icons"

export interface SelectOption {
  value: string
  label: string
  hint?: string
}

interface SelectProps {
  label: string
  required?: boolean
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function Select({
  label,
  required = false,
  options,
  value,
  onChange,
  error,
  placeholder = "Select an option",
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="w-full" ref={selectRef}>
      <label className={cn("block text-xs font-semibold text-text-primary", required && "text-error-500")}>
        {label}
        {required && <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>}
      </label>

      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            value ? "text-text-primary" : "text-text-secondary",
            error && "border-error-500 focus:border-error-500 focus:ring-error-500/30",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          style={{ fontSize: "16px" }}
        >
          <span className="truncate flex-1">{value ? selectedOption?.label : placeholder}</span>
          {isOpen ? <ChevronUp size={18} className="shrink-0 text-text-secondary" /> : <ChevronDown size={18} className="shrink-0 text-text-secondary" />}
        </button>

        {isOpen && (
          <ul
            role="listbox"
            aria-label={label}
            className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border bg-surface shadow-lg ring-1 ring-border"
          >
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={value === opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                    value === opt.value
                      ? "bg-primary/5 text-primary"
                      : "text-text-primary hover:bg-surface-secondary",
                  )}
                  style={{ fontSize: "16px" }}
                >
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                  {value === opt.value && <Check size={16} className="shrink-0 text-primary" />}
                </button>
                {opt.hint && (
                  <div className="px-3 pb-1.5 text-[11px] leading-snug text-text-secondary border-t border-border/50">
                    {opt.hint}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-error-500" role="alert">{error}</p>}
    </div>
  )
}