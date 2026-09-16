"use client"
import { useRef, KeyboardEvent } from "react"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

export function OtpInput({ value, onChange, length = 6, disabled = false }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const newVal = value.split("")
    newVal[index] = val.slice(-1)
    const joined = newVal.join("").slice(0, length)
    onChange(joined)
    if (val && index < length - 1) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "")
    onChange(text.slice(0, length))
    const focusIndex = Math.min(text.length, length - 1)
    inputs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste} role="group" aria-label="6-digit verification code">
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={(el) => { inputs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""} onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)} disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          style={{ fontSize: "16px" }}
          className="h-12 w-12 min-w-0 max-w-12 flex-1 rounded-xl border border-border bg-surface-secondary text-center text-lg font-bold text-text-primary focus:border-accent-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent-500/25 disabled:opacity-50" />
      ))}
    </div>
  )
}