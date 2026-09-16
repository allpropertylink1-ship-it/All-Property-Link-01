"use client"
import { useState } from "react"
import { api } from "@/lib/api-client"
import { AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { CheckCircle, Mail } from "@/components/ui/icons"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: reqError } = await api.post("/api/auth/forgot-password", { email })
    if (reqError) {
      setError(reqError)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600">
          <CheckCircle size={22} />
        </span>
        <FormBanner variant="success">
          If an account exists with that email, we&apos;ve sent a reset link. A password reset token valid for 15 minutes will be sent to this email.
        </FormBanner>
        <a
          href="/auth/login"
          className="touch-target inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to sign in
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
        <label htmlFor="email" className="block text-sm font-semibold text-text-primary">
          Registered Email Address
        </label>
        <div className="relative">
          <InputLeadingIcon icon={Mail} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Registered Email Address"
            className={stitchInputWithIconClass}
            style={{ fontSize: "16px" }}
            placeholder="e.g. kamau.mwangi@example.co.ke"
          />
        </div>
        <p className="mt-1 text-xs text-text-secondary">A password reset token valid for 15 minutes will be sent to this email.</p>
      </div>
      <AuthSubmitButton loading={loading} label="Send Password Reset Link" loadingLabel="Sending..." />
      <p className="text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <a href="/auth/login" className="font-semibold text-accent-600 hover:text-accent-700">
          Log In
        </a>
      </p>
    </form>
  )
}
