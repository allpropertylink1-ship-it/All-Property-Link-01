"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { OtpInput } from "./OtpInput"
import { normalizeKenyanPhoneClient, kenyanPhoneError } from "./RegisterForm.utils"
import { SetPasswordForm } from "./SetPasswordForm"
import { AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Mail } from "@/components/ui/icons"
import { resolvePostAuthTarget } from "@/lib/persona"

export function LoginForm({ onSwitchToRegister, returnUrl }: { onSwitchToRegister?: () => void; returnUrl?: string }) {
  const router = useRouter()
  const { login, sendMagicLink, phoneLogin, verifyOtp } = useAuth()
  const [error, setError] = useState("")
  // Precise sign-in errors: which input the message belongs to (email field
  // doubles for phone numbers typed into the main form). The banner always
  // shows the message; the matching input also gets an inline error.
  const [errorField, setErrorField] = useState<"email" | "password" | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [magicEmail, setMagicEmail] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [magicError, setMagicError] = useState("")
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Phase 2 (2026-09): flagged accounts are blocked at password login and
  // must recover via SMS code or email link, then set a personal password.
  const [resetRequired, setResetRequired] = useState(false)
  const [forceSetPassword, setForceSetPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setErrorField(null)

    const form = new FormData(e.currentTarget)
    const identifier = ((form.get("email") as string) || "").trim()
    const password = form.get("password") as string

    // Client-side precise checks so typos are flagged without a round-trip.
    if (!identifier) {
      setError("Enter your email address or phone number")
      setErrorField("email")
      setLoading(false)
      return
    }
    if (!password) {
      setError("Enter your password")
      setErrorField("password")
      setLoading(false)
      return
    }
    if (identifier.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setError("That email address looks invalid. Check for typos and try again.")
        setErrorField("email")
        setLoading(false)
        return
      }
    } else if (/^[\d+\s\-()]{7,}$/.test(identifier)) {
      if (!normalizeKenyanPhoneClient(identifier)) {
        setError("That phone number looks invalid. Enter a valid Kenyan mobile number.")
        setErrorField("email")
        setLoading(false)
        return
      }
    } else {
      setError("That email address looks invalid. Check for typos and try again.")
      setErrorField("email")
      setLoading(false)
      return
    }

    const result = await login(identifier, password, rememberMe)

    if (result?.error) {
      if (result?.code === "PASSWORD_RESET_REQUIRED") {
        setResetRequired(true)
      }
      setError(result.error)
      // Backend sends the offending field; fall back to code mapping so
      // older responses still highlight the right input.
      const field = result?.field ?? result?.code
      setErrorField(
        field === "password" || field === "PASSWORD_REQUIRED" || field === "INCORRECT_PASSWORD" || field === "PASSWORD_NOT_SET"
          ? "password"
          : "email"
      )
      setLoading(false)
      return
    }

    // Optimistic: hydrated user routes by persona; undefined falls back to
    // /dashboard where the server (source of truth) forwards by persona.
    router.push(resolvePostAuthTarget(result?.user ?? null, returnUrl))
    router.refresh()
  }

  async function handleMagicLink() {
    if (!magicEmail) return
    setMagicError("")
    const { error } = await sendMagicLink(magicEmail)
    if (error) {
      setMagicError(error)
      return
    }
    setMagicSent(true)
  }

  async function handlePhoneSendCode() {
    const err = kenyanPhoneError(phone)
    if (err) {
      setPhoneError(err)
      return
    }
    setPhoneLoading(true)
    setPhoneError("")
    const fullPhone = normalizeKenyanPhoneClient(phone)!
    const result = await phoneLogin(fullPhone)
    if (result?.error) {
      setPhoneError(result.error)
      setPhoneLoading(false)
      return
    }
    setPhoneLoading(false)
    setPhoneStep("otp")
    setOtpCooldown(60)
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handlePhoneVerify() {
    const code = otpValues.join("")
    if (code.length !== 6) return
    setOtpLoading(true)
    setPhoneError("")
    const fullPhone = normalizeKenyanPhoneClient(phone)
    if (!fullPhone) {
      setPhoneError("That phone number looks invalid. Please go back and check it.")
      setOtpLoading(false)
      return
    }
    const result = await verifyOtp(fullPhone, code, "PHONE_VERIFICATION", rememberMe)
    if (result?.error) {
      setPhoneError(result.error)
      setOtpLoading(false)
      return
    }
    // Flagged sessions (migrated cohort) must set a personal password first.
    if ((result?.user as { requiresPasswordChange?: boolean } | undefined)?.requiresPasswordChange) {
      setForceSetPassword(true)
      setOtpLoading(false)
      return
    }
    router.push(resolvePostAuthTarget(result?.user ?? null, returnUrl))
    router.refresh()
  }

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])

  // Flagged session (verified via SMS code): set a personal password first.
  if (forceSetPassword) {
    return (
      <SetPasswordForm
        onDone={() => {
          router.push(returnUrl || "/dashboard")
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}
        {resetRequired && (
          <div className="rounded-lg border border-accent-500/40 bg-accent-50 p-2.5 text-[13px] text-text-primary" role="status">
            <p className="font-semibold">Set a personal password first.</p>
            <p className="mt-0.5 text-text-secondary">
              Use an SMS code below, or{" "}
              <a href="/auth/forgot-password" className="font-semibold text-accent-600 hover:text-accent-700">
                reset via email
              </a>
              .
            </p>
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-[13px] font-semibold text-text-primary">
            Email or phone
          </label>
          <div className="relative">
            <InputLeadingIcon icon={Mail} />
            <input
              id="email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              required
              aria-invalid={errorField === "email"}
              aria-describedby={errorField === "email" ? "login-email-error" : undefined}
              onChange={() => { if (errorField === "email") { setErrorField(null); setError("") } }}
              className={stitchInputWithIconClass}
              style={{ fontSize: "16px" }}
              placeholder="you@example.co.ke or 712345678"
            />
          </div>
          {errorField === "email" && error && (
            <p id="login-email-error" className="mt-1 text-xs text-error-500" role="alert">{error}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-semibold text-text-primary">
              Password
            </label>
            <a
              href="/auth/forgot-password"
              className="text-[13px] font-semibold text-accent-600 hover:text-accent-700"
            >
              Forgot password?
            </a>
          </div>
          <div className="mt-1">
            <PasswordToggle
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
              ariaInvalid={errorField === "password"}
              ariaDescribedBy={errorField === "password" ? "login-password-error" : undefined}
              onChange={() => { if (errorField === "password") { setErrorField(null); setError("") } }}
            />
            {errorField === "password" && error && (
              <p id="login-password-error" className="mt-1 text-xs text-error-500" role="alert">{error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1.5" htmlFor="remember-me">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary"
            />
            <span className="text-[13px] text-text-secondary">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (magicSent) { setMagicSent(false); setMagicEmail(""); setMagicError("") }
              setShowMagicLink(!showMagicLink)
            }}
            className="text-[13px] font-semibold text-primary-600 hover:text-primary-700"
          >
            {showMagicLink ? "Hide email link" : "Email me a link"}
          </button>
        </div>

        {showMagicLink && (
          magicSent ? (
            <div className="space-y-2">
              <FormBanner variant="success">
                Link sent — check your inbox.
              </FormBanner>
              <button
                type="button"
                onClick={() => { setMagicSent(false); setMagicEmail(""); setMagicError("") }}
                className="touch-target w-full rounded-lg border border-primary px-4 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
              >
                Send again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email for magic link"
                  style={{ fontSize: "16px" }}
                  className="block min-w-0 flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={!magicEmail}
                  className="touch-target rounded-lg border border-primary px-4 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              {magicError && (
                <p className="text-xs text-error-500" role="alert">{magicError}</p>
              )}
            </div>
          )
        )}

        <AuthSubmitButton loading={loading} label="Sign in" loadingLabel="Signing in..." />
      </form>

      <details className="group rounded-lg border border-border bg-surface-secondary/50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-center text-[13px] font-semibold text-primary-600 hover:text-primary-700">
          <span className="group-open:hidden">Or continue with phone</span>
          <span className="hidden group-open:inline">Hide phone sign-in</span>
        </summary>
        <div className="space-y-2.5 px-3 pb-3">
          {phoneStep === "phone" ? (
            <>
              {phoneError && (
                <FormBanner variant="error">{phoneError}</FormBanner>
              )}
              <div>
                <label htmlFor="login-phone" className="block text-[13px] font-semibold text-text-primary">Phone</label>
                <div className="mt-1 flex">
                  <span className="inline-flex items-center rounded-lg rounded-r-none border border-r-0 border-border bg-surface-secondary px-2.5 text-[13px] text-text-secondary">
                    +254
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={13}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError("") }}
                    placeholder="712345678 or 0112345678"
                    className="block w-full rounded-lg rounded-l-none border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handlePhoneSendCode}
                disabled={phoneLoading}
                aria-busy={phoneLoading}
                className="touch-target w-full rounded-lg border border-primary px-4 py-2 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
              >
                {phoneLoading ? "Sending..." : "Send login code"}
              </button>
            </>
          ) : (
            <div className="space-y-2.5">
              {phoneError && (
                <FormBanner variant="error">{phoneError}</FormBanner>
              )}
              <p className="text-center text-[13px] text-text-secondary">
                A code is on its way to <strong className="text-text-primary">{normalizeKenyanPhoneClient(phone) ?? phone}</strong>.
              </p>
              <OtpInput
                value={otpValues.join("")}
                onChange={(val) => {
                  const arr = new Array(6).fill("")
                  val.split("").forEach((d, i) => { if (i < 6) arr[i] = d })
                  setOtpValues(arr)
                }}
                disabled={otpLoading}
              />
              <button
                type="button"
                onClick={handlePhoneVerify}
                disabled={otpLoading || otpValues.join("").length !== 6}
                aria-busy={otpLoading}
                className="touch-target w-full rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify code"}
              </button>
              <div className="text-center">
                {otpCooldown > 0 ? (
                  <span className="text-xs text-text-secondary">Resend in {otpCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPhoneStep("phone"); setOtpValues(["", "", "", "", "", ""]); setPhoneError("") }}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Change number
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </details>

      <p className="pt-0.5 text-center text-[13px] text-text-secondary">
        New here?{" "}
        {onSwitchToRegister ? (
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-accent-600 hover:text-accent-700">
            Create account
          </button>
        ) : (
          <a href="/auth/register" className="font-semibold text-accent-600 hover:text-accent-700">
            Create account
          </a>
        )}
      </p>
    </div>
  )
}
