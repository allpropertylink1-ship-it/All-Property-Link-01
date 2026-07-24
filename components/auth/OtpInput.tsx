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
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={(el) => { inputs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""} onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)} disabled={disabled}
          autoFocus={i === 0}
          className="h-12 w-12 rounded-xl border border-border text-center text-lg font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-50" />
      ))}
    </div>
  )
}