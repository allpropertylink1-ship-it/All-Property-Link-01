"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { GoogleSignInButton } from "./GoogleSignInButton"

export function LoginForm() {
  const router = useRouter()
  const { login, sendMagicLink, phoneLogin, verifyOtp, refreshUser } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicEmail, setMagicEmail] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [magicError, setMagicError] = useState("")
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const result = await login(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
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
    otpInputRefs.current[0]?.focus()
  }

  async function handlePhoneVerify() {
    const code = otpValues.join("")
    if (code.length !== 6) return
    setOtpLoading(true)
    setPhoneError("")
    const digits = phone.replace(/\D/g, "")
    const fullPhone = `+254${digits}`
    const result = await verifyOtp(fullPhone, code, "PHONE_VERIFICATION")
    if (result?.error) {
      setPhoneError(result.error)
      setOtpLoading(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  function handleOtpInput(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("")
      const newValues = [...otpValues]
      for (let i = 0; i < 6 && i < digits.length; i++) newValues[i] = digits[i]
      setOtpValues(newValues)
      const nextIndex = Math.min(digits.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }
    if (!/^\d*$/.test(value)) return
    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])

  return (
    <>
      <div className="mb-6">
        <GoogleSignInButton
          mode="signin"
          onSuccess={async () => { await refreshUser(); router.push("/dashboard"); router.refresh() }}
          onError={(msg) => setError(msg)}
        />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-secondary">or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
            style={{ fontSize: "16px" }}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
            Password
          </label>
          <div className="mt-1">
            <PasswordToggle
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMagicSent(false)}
            className="text-sm font-medium text-accent-300 hover:text-accent-400"
          >
            {magicSent ? "Send again" : "Send magic link"}
          </button>
          <a
            href="/auth/forgot-password"
            className="text-sm font-medium text-accent-300 hover:text-accent-400"
          >
            Forgot password?
          </a>
        </div>

        {magicSent ? (
          <div className="rounded-lg bg-accent-300/10 px-4 py-3 text-sm text-accent-600">
            Magic link sent! Check your email inbox.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              placeholder="your@email.com"
              className="block flex-1 rounded-sm border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
            />
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={!magicEmail}
              className="touch-target rounded-sm border border-accent-300 px-4 py-3 text-sm font-medium text-accent-300 transition-colors hover:bg-accent-300/10 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
        {magicError && (
          <p className="text-xs text-error-500">{magicError}</p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-text-secondary">or sign in with phone</span>
          </div>
        </div>

        {phoneStep === "phone" ? (
          <div className="space-y-3">
            {phoneError && (
              <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{phoneError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-sm rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">
                  +254
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError("") }}
                  placeholder="712 345 678"
                  className="block w-full rounded-sm rounded-l-none border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
            </div>
            <button
              type="button"
              onClick={handlePhoneSendCode}
              disabled={phoneLoading}
              className="touch-target w-full rounded-sm border border-accent-300 px-4 py-3 text-sm font-medium text-accent-300 transition-colors hover:bg-accent-300/10 disabled:opacity-50"
            >
              {phoneLoading ? "Sending code..." : "Send login code"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {phoneError && (
              <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{phoneError}</div>
            )}
            <p className="text-sm text-text-secondary text-center">
              We sent a code to <strong className="text-text-primary">+254{phone.replace(/\D/g, "")}</strong>
            </p>
            <div className="flex justify-center gap-2">
              {otpValues.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpInputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="h-14 w-12 rounded-sm border border-border bg-surface text-center text-xl font-bold text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handlePhoneVerify}
              disabled={otpLoading || otpValues.join("").length !== 6}
              className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="text-xs font-medium text-accent-300 hover:text-accent-400"
                >
                  Change phone number
                </button>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="font-medium text-accent-300 hover:text-accent-400">
            Register
          </a>
        </p>
      </form>
    </>
  )
}
