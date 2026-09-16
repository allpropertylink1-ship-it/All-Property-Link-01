"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api-client"
import { PasswordToggle } from "./PasswordToggle"
import { PasswordStrength } from "./PasswordStrength"
import { AuthSubmitButton } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { CheckCircle } from "@/components/ui/icons"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!token) {
      setError("Invalid reset link")
      setLoading(false)
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    const { error: reqError } = await api.post("/api/auth/reset-password", { token, password })
    if (reqError) {
      setError(reqError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600">
          <CheckCircle size={22} />
        </span>
        <FormBanner variant="success">
          Password reset successful! You can now sign in with your new password.
        </FormBanner>
        <a
          href="/auth/login"
          className="touch-target inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Sign in
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
          New Password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Create a strong password"
          />
        </div>
        <PasswordStrength password={password} />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-semibold text-text-primary">
          Confirm New Password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="confirm"
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Passwords must match exactly"
          />
        </div>
      </div>
      <AuthSubmitButton loading={loading} label="Update Password and Sign In" loadingLabel="Resetting..." />
      <p className="text-center text-sm text-text-secondary">
        <a href="/auth/login" className="font-semibold text-accent-600 hover:text-accent-700">
          Cancel and Return to Sign In
        </a>
      </p>
    </form>
  )
}
