"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type OtpResponse } from "@/lib/auth-context"
import { PasswordStrength } from "./PasswordStrength"
import { PasswordToggle } from "./PasswordToggle"
import { GoogleSignInButton } from "./GoogleSignInButton"
import { Home, Handshake, Wrench, Briefcase, ArrowLeft } from "@/components/ui/icons"

type ContactMethod = "email" | "phone"
type Step = "userType" | "form" | "otp"

const userTypeOptions = [
  { value: "PROPERTY_OWNER", label: "Property Owner", description: "I want to list properties for sale or rent", icon: Home },
  { value: "AGENT", label: "Agent", description: "I want to list properties on behalf of clients", icon: Handshake },
  { value: "FUNDI", label: "Fundi", description: "I offer trade services like plumbing, electrical, carpentry", icon: Wrench },
  { value: "SERVICE_PROVIDER", label: "Service Provider", description: "I offer services like cleaning, security, property management", icon: Briefcase },
]

export function RegisterForm({ referralCode: initialReferralCode }: { referralCode?: string }) {
  const router = useRouter()
  const { signup, sendOtp, verifyOtp, refreshUser, updateRegistration } = useAuth()
  const [step, setStep] = useState<Step>("userType")
  const [userType, setUserType] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email")
  const [password, setPassword] = useState("")
  const [referralCode, setReferralCode] = useState(initialReferralCode || "")
  const [otpIdentifier, setOtpIdentifier] = useState("")
  const [otpType, setOtpType] = useState<"EMAIL_VERIFICATION" | "PHONE_VERIFICATION">("EMAIL_VERIFICATION")
  const [otpDestination, setOtpDestination] = useState("")
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [otpLoading, setOtpLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [otpExpiresIn, setOtpExpiresIn] = useState(600)
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current)
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])

  function startCooldown(seconds: number) {
    setCooldown(seconds)
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function startExpiryTimer(seconds: number) {
    setOtpExpiresIn(seconds)
    if (otpTimerRef.current) clearInterval(otpTimerRef.current)
    otpTimerRef.current = setInterval(() => {
      setOtpExpiresIn((prev) => {
        if (prev <= 1) {
          if (otpTimerRef.current) clearInterval(otpTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleUserTypeNext() {
    if (!userType) return
    setStep("form")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const confirmPassword = form.get("confirmPassword") as string
    const firstName = form.get("firstName") as string
    const lastName = form.get("lastName") as string
    const email = contactMethod === "email" ? (form.get("email") as string) : ""
    const phoneRaw = contactMethod === "phone" ? (form.get("phone") as string) : ""
    const phone = phoneRaw ? `+254${phoneRaw.replace(/\D/g, "")}` : ""

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (contactMethod === "phone" && phoneRaw.replace(/\D/g, "").length !== 9) {
      setError("Please enter a valid 9-digit Kenyan phone number")
      setLoading(false)
      return
    }

    if (contactMethod === "email") {
      if (!email) {
        setError("Email is required")
        setLoading(false)
        return
      }
    }

    let result: { error?: string; otp?: OtpResponse }

    if (otpIdentifier) {
      result = await updateRegistration({
        oldIdentifier: otpIdentifier,
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        firstName, lastName,
      })
      if (!result.otp) {
        setOtpIdentifier("")
        setOtpType("EMAIL_VERIFICATION")
        setOtpDestination("")
      }
    } else {
      result = await signup({ firstName, lastName, password, email, phone, referralCode: referralCode || undefined, userType: userType || undefined })
    }

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.otp) {
      setOtpIdentifier(result.otp.identifier)
      setOtpType(result.otp.type)
      setOtpDestination(result.otp.otpDestination)
      startCooldown(result.otp.retryAfter)
      startExpiryTimer(result.otp.expiresIn)
      setStep("otp")
    }
    setLoading(false)
  }

  async function handleOtpVerify() {
    const code = otpValues.join("")
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }
    setOtpLoading(true)
    setError("")

    const { error: verifyError } = await verifyOtp(otpIdentifier, code, otpType)
    if (verifyError) {
      setError(verifyError)
      setOtpLoading(false)
      return
    }

    setOtpLoading(false)
    router.push("/dashboard")
  }

  async function handleResendOtp() {
    if (cooldown > 0) return
    setError("")
    const { error: sendError } = await sendOtp(otpIdentifier, otpType)
    if (sendError) {
      setError(sendError)
      return
    }
    startCooldown(60)
    setOtpValues(["", "", "", "", "", ""])
    otpInputRefs.current[0]?.focus()
  }

  function handleOtpInput(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("")
      const newValues = [...otpValues]
      for (let i = 0; i < 6 && i < digits.length; i++) {
        newValues[i] = digits[i]
      }
      setOtpValues(newValues)
      const nextIndex = Math.min(digits.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }
    if (!/^\d*$/.test(value)) return
    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "")
    const digits = text.split("").slice(0, 6)
    const newValues = [...otpValues]
    for (let i = 0; i < 6; i++) {
      newValues[i] = digits[i] || ""
    }
    setOtpValues(newValues)
    const focusIndex = Math.min(digits.length, 5)
    otpInputRefs.current[focusIndex]?.focus()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (step === "otp") {
    return (
      <div>
        <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Verify your {otpType === "EMAIL_VERIFICATION" ? "email" : "phone"}</h2>
        <p className="mb-6 text-sm text-text-secondary">
          We sent a code to <strong className="text-text-primary">{otpDestination}</strong>
          <button
            type="button"
            onClick={() => { setStep("form"); setOtpValues(["", "", "", "", "", ""]) }}
            className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-accent-300 hover:text-accent-400"
          >
            Edit
          </button>
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
        )}

        <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
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
              style={{ fontSize: "20px" }}
            />
          ))}
        </div>

        <button
          onClick={handleOtpVerify}
          disabled={otpLoading || otpValues.join("").length !== 6}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {otpLoading ? "Verifying..." : "Verify code"}
        </button>

        <div className="mt-4 text-center space-y-1">
          {otpExpiresIn > 0 ? (
            <p className="text-xs text-text-secondary">Code expires in {formatTime(otpExpiresIn)}</p>
          ) : (
            <p className="text-xs text-error-500">Code expired. Request a new one.</p>
          )}
          <div>
            {cooldown > 0 ? (
              <span className="text-xs text-text-secondary">Resend code in {formatTime(cooldown)}</span>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-xs font-medium text-accent-300 hover:text-accent-400"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === "userType") {
    return (
      <div className="space-y-6">
        <h2 className="font-heading text-xl font-bold text-text-primary">Choose your account type</h2>
        <p className="text-sm text-text-secondary">Select the type of account that best describes you.</p>

        {error && (
          <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
        )}

        <div className="grid gap-3">
          {userTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUserType(opt.value)}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                userType === opt.value
                  ? "border-accent-300 bg-accent-300/10"
                  : "border-border hover:border-accent-300"
              }`}
            >
              <opt.icon size={24} className={userType === opt.value ? "text-accent-300" : "text-text-secondary"} />
              <div>
                <p className="font-medium text-text-primary">{opt.label}</p>
                <p className="text-sm text-text-secondary">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleUserTypeNext}
          disabled={!userType}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <GoogleSignInButton
          mode="signup"
          onSuccess={async () => { await refreshUser(); router.push("/dashboard") }}
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

      <button type="button" onClick={() => setStep("userType")} className="mb-4 flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">Last name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Contact method</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContactMethod("email")}
              className={`flex-1 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                contactMethod === "email"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("phone")}
              className={`flex-1 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                contactMethod === "phone"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}
            >
              Phone (+254)
            </button>
          </div>
        </div>

        {contactMethod === "email" ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email</label>
            <div className="relative mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
className="block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                style={{ fontSize: "16px" }}
                placeholder="you@example.com"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">Phone number</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-sm rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">
                +254
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                maxLength={9}
                className="block w-full rounded-sm rounded-l-none border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                style={{ fontSize: "16px" }}
                placeholder="712 345 678"
              />
            </div>
            <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">Password</label>
          <div className="mt-1">
            <PasswordToggle
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirm password</label>
          <div className="mt-1">
            <PasswordToggle
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-text-primary">Referral Code (optional)</label>
          <div className="mt-1">
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="APL-XXX-000-00/00"
              className="block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-accent-300 hover:text-accent-400">Sign in</a>
        </p>
      </form>
    </>
  )
}
