"use client"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { PasswordStrength } from "./PasswordStrength"
import { AuthSubmitButton } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"

// Phase 2 (2026-09): forced personal reset for flagged sessions
// (migrated cohort sharing one known password). No current password is
// needed — the session itself (OTP / magic-link / Google) is the proof.
// On success the flag clears server-side and all sessions revoke.
export function SetPasswordForm({ onDone, title, subtitle }: {
  onDone: () => void
  title?: string
  subtitle?: string
}) {
  const { changePassword } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain uppercase, lowercase, and a number")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    const result = await changePassword(password)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-text-primary">
          {title || "Set your personal password"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {subtitle || "Your account is using a temporary password. Choose a personal one to continue."}
        </p>
      </div>
      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}
      <div>
        <label htmlFor="new-password" className="block text-sm font-semibold text-text-primary">
          New password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="new-password"
            name="new-password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Choose a strong password"
          />
        </div>
        <PasswordStrength password={password} />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-semibold text-text-primary">
          Confirm new password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
          />
        </div>
      </div>
      <AuthSubmitButton loading={loading} label="Save new password" loadingLabel="Saving..." />
    </form>
  )
}
