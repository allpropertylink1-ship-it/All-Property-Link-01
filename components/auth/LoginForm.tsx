"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { OtpInput } from "./OtpInput"
import { normalizeKenyanPhoneClient, kenyanPhoneError } from "./RegisterForm.utils"
import { SetPasswordForm } from "./SetPasswordForm"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Mail } from "@/components/ui/icons"
import { resolvePostAuthTarget } from "@/lib/persona"
import { InlineInput } from "./InlineInput"

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const router = useRouter()
  const { login, sendMagicLink, phoneLogin, verifyOtp } = useAuth()
  const [error, setError] = useState("")
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
      const field = result?.field ?? result?.code
      setErrorField(
        field === "password" || field === "PASSWORD_REQUIRED" || field === "INCORRECT_PASSWORD" || field === "PASSWORD_NOT_SET"
          ? "password"
          : "email"
      )
      setLoading(false)
      return
    }

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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormBanner variant="error">{error}</FormBanner>}

        {resetRequired && (
          <div className="rounded-lg border border-accent-500/40 bg-accent-50 p-3 text-sm text-text-primary" role="status">
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

        {/* Email or phone - inline */}
        <InlineInput
          label="Email or phone"
          required
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="username"
          value=""
          onChange={() => { if (errorField === "email") { setErrorField(null); setError("") } }}
          placeholder="you@example.co.ke or 712345678"
          error={errorField === "email" ? error : undefined}
          leadingIcon={<Mail size={16} />}
        />

        {/* Password - inline */}
        <InlineInput
          label="Password"
          required
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errorField === "password" ? error : undefined}
          trailingIcon={
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
          }
        />

        {/* Remember me + Magic link */}
        <div className="flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1.5" htmlFor="remember-me">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (magicSent) { setMagicSent(false); setMagicEmail(""); setMagicError("") }
              setShowMagicLink(!showMagicLink)
            }}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {showMagicLink ? "Hide email link" : "Email me a link"}
          </button>
        </div>

        {showMagicLink && (
          <details className="group rounded-lg border border-border bg-surface-secondary/50">
            <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
              <span className="group-open:hidden">Email magic link</span>
              <span className="hidden group-open:inline">Hide email link</span>
            </summary>
            <div className="px-3 pb-3 space-y-2">
              {magicSent ? (
                <>
                  <FormBanner variant="success">Link sent — check your inbox.</FormBanner>
                  <button
                    type="button"
                    onClick={() => { setMagicSent(false); setMagicEmail(""); setMagicError("") }}
                    className="touch-target w-full rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                  >
                    Send again
                  </button>
                </>
              ) : (
                <>
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
                      className="touch-target rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                  {magicError && <p className="text-xs text-error-500" role="alert">{magicError}</p>}
                </>
              )}
            </div>
          </details>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Phone sign-in */}
      <details className="group rounded-lg border border-border bg-surface-secondary/50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-center text-sm font-semibold text-primary-600 hover:text-primary-700">
          <span className="group-open:hidden">Or continue with phone</span>
          <span className="hidden group-open:inline">Hide phone sign-in</span>
        </summary>
        <div className="space-y-3 px-3 pb-3">
          {phoneStep === "phone" ? (
            <>
              {phoneError && <FormBanner variant="error">{phoneError}</FormBanner>}
              <InlineInput
                label="Phone"
                required
                id="login-phone"
                name="login-phone"
                type="tel"
                inputMode="numeric"
                maxLength={13}
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError("") }}
                placeholder="712345678 or 0112345678"
                leadingIcon={<span className="text-text-secondary">+254</span>}
              />
              <button
                type="button"
                onClick={handlePhoneSendCode}
                disabled={phoneLoading}
                aria-busy={phoneLoading}
                className="touch-target w-full rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
              >
                {phoneLoading ? "Sending..." : "Send login code"}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              {phoneError && <FormBanner variant="error">{phoneError}</FormBanner>}
              <p className="text-center text-sm text-text-secondary">
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
                className="touch-target w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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

      <p className="pt-0.5 text-center text-sm text-text-secondary">
        New here?{" "}
        <a
          href={`/auth/register${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ""}`}
          className="font-semibold text-accent-600 hover:text-accent-700"
        >
          Create account
        </a>
      </p>
    </div>
  )
}