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
  // Precise recovery errors: EMAIL_NOT_FOUND gets a sign-up link so the
  // user can fix a typo or create an account.
  const [errorCode, setErrorCode] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setErrorCode("")

    const trimmed = email.trim()
    // Client-side precise checks so typos are flagged without a round-trip.
    if (!trimmed) {
      setError("Enter your email address")
      setLoading(false)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("That email address looks invalid. Check for typos and try again.")
      setErrorCode("INVALID_EMAIL")
      setLoading(false)
      return
    }

    const { error: reqError, code } = await api.post("/api/auth/forgot-password", { email: trimmed })
    if (reqError) {
      setError(reqError)
      setErrorCode(code ?? "")
      setLoading(false)
      return
    }

    setEmail(trimmed)
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
          We&apos;ve sent a password reset link to <strong>{email}</strong>. A password reset token valid for 15 minutes will be sent to this email.
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
        <FormBanner variant="error">
          {errorCode === "EMAIL_NOT_FOUND" ? (
            <span>
              {error}{" "}
              <a href="/auth/register" className="font-semibold underline underline-offset-2 hover:no-underline">
                Create a new account
              </a>
            </span>
          ) : (
            error
          )}
        </FormBanner>
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
            type="text"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) { setError(""); setErrorCode("") } }}
            aria-label="Registered Email Address"
            aria-invalid={!!error}
            aria-describedby={error ? "forgot-email-error" : undefined}
            className={stitchInputWithIconClass}
            style={{ fontSize: "16px" }}
            placeholder="e.g. kamau.mwangi@example.co.ke"
          />
        </div>
        {error ? (
          <p id="forgot-email-error" className="mt-1 text-xs text-error-500" role="alert">
            {errorCode === "EMAIL_NOT_FOUND" ? (
              <span>
                {error}{" "}
                <a href="/auth/register" className="font-semibold underline underline-offset-2 hover:no-underline">
                  Create a new account
                </a>
              </span>
            ) : (
              error
            )}
          </p>
        ) : (
          <p className="mt-1 text-xs text-text-secondary">A password reset token valid for 15 minutes will be sent to this email.</p>
        )}
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
