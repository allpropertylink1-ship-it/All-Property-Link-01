"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { GoogleSignInButton } from "./GoogleSignInButton"
import { OtpInput } from "./OtpInput"
import { AuthAssurance, AuthDivider, AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Mail } from "@/components/ui/icons"
import { resolvePostAuthTarget } from "@/lib/persona"

export function LoginForm({ onSwitchToRegister, returnUrl }: { onSwitchToRegister?: () => void; returnUrl?: string }) {
  const router = useRouter()
  const { login, sendMagicLink, phoneLogin, verifyOtp, refreshUser } = useAuth()
  const [error, setError] = useState("")
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const result = await login(email, password, rememberMe)

    if (result?.error) {
      setError(result.error)
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
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 9) {
      setPhoneError("Please enter a valid 9-digit Kenyan phone number")
      return
    }
    setPhoneLoading(true)
    setPhoneError("")
    const fullPhone = `+254${digits}`
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
    const digits = phone.replace(/\D/g, "")
    const fullPhone = `+254${digits}`
    const result = await verifyOtp(fullPhone, code, "PHONE_VERIFICATION", rememberMe)
    if (result?.error) {
      setPhoneError(result.error)
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-text-primary">
            Email Address
          </label>
          <div className="relative">
            <InputLeadingIcon icon={Mail} />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-label="Email Address"
              className={stitchInputWithIconClass}
              style={{ fontSize: "16px" }}
              placeholder="e.g. kamau.mwangi@example.co.ke"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
              Password
            </label>
            <a
              href="/auth/forgot-password"
              className="text-sm font-semibold text-accent-600 hover:text-accent-700"
            >
              Forgot Password?
            </a>
          </div>
          <div className="mt-1">
            <PasswordToggle
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your secure password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2" htmlFor="remember-me">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Keep me logged in on this device</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (magicSent) { setMagicSent(false); setMagicEmail(""); setMagicError("") }
              setShowMagicLink(!showMagicLink)
            }}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {showMagicLink ? "Cancel magic link" : "Use magic link"}
          </button>
        </div>

        {showMagicLink && (
          magicSent ? (
            <div className="space-y-3">
              <FormBanner variant="success">
                Magic link sent! Check your email inbox.
              </FormBanner>
              <button
                type="button"
                onClick={() => { setMagicSent(false); setMagicEmail(""); setMagicError("") }}
                className="touch-target w-full rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
              >
                Send again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email for magic link"
                  style={{ fontSize: "16px" }}
                  className="block min-w-0 flex-1 rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={!magicEmail}
                  className="touch-target rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
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

        <AuthSubmitButton loading={loading} label="Sign In to Account" loadingLabel="Verifying Credentials..." />
      </form>

      <AuthDivider />

      <GoogleSignInButton
        mode="signin"
        onSuccess={async () => {
          const u = await refreshUser()
          router.push(resolvePostAuthTarget(u ?? null, returnUrl))
          router.refresh()
        }}
        onError={(msg) => setError(msg)}
      />

      <div className="space-y-4">
        <AuthDivider label="or sign in with phone" />

        {phoneStep === "phone" ? (
          <div className="space-y-3">
            {phoneError && (
              <FormBanner variant="error">{phoneError}</FormBanner>
            )}
            <div>
              <label htmlFor="login-phone" className="block text-sm font-semibold text-text-primary">Phone number</label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-xl rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">
                  +254
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError("") }}
                  placeholder="712 345 678"
                  aria-label="Phone number, last 9 digits"
                  className="block w-full rounded-xl rounded-l-none border border-border bg-surface-secondary px-4 py-3.5 text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
            </div>
            <button
              type="button"
              onClick={handlePhoneSendCode}
              disabled={phoneLoading}
              aria-busy={phoneLoading}
              className="touch-target w-full rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              {phoneLoading ? "Sending code..." : "Send login code"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {phoneError && (
              <FormBanner variant="error">{phoneError}</FormBanner>
            )}
            <p className="text-center text-sm text-text-secondary">
              We sent a code to <strong className="text-text-primary">+254{phone.replace(/\D/g, "")}</strong>
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
              className="touch-target w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {otpLoading ? "Verifying..." : "Verify code"}
            </button>
            <div className="text-center">
              {otpCooldown > 0 ? (
                <span className="text-xs text-text-secondary">Resend code in {otpCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => { setPhoneStep("phone"); setOtpValues(["", "", "", "", "", ""]); setPhoneError("") }}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Change phone number
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="pt-1 text-center text-sm text-text-secondary">
        Don&apos;t have an active account?{" "}
        {onSwitchToRegister ? (
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-accent-600 hover:text-accent-700">
            Apply for Registration
          </button>
        ) : (
          <a href="/auth/register" className="font-semibold text-accent-600 hover:text-accent-700">
            Apply for Registration
          </a>
        )}
      </p>

      <AuthAssurance>
        256-Bit SSL Encryption and Kenya Data Protection Act 2019 Compliant
      </AuthAssurance>
    </div>
  )
}
