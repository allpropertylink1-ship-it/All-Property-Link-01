"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type OtpResponse } from "@/lib/auth-context"
import { OtpInput } from "./OtpInput"
import { RegisterUserTypeSelector } from "./RegisterUserTypeSelector"
import { RegisterAccountInfo } from "./RegisterAccountInfo"
import { formatTime } from "./RegisterForm.utils"

type ContactMethod = "email" | "phone"
type Step = "userType" | "form" | "otp"

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
  }

  async function handleGoogleSuccess() {
    await refreshUser()
    router.push("/dashboard")
  }

  function handleGoogleError(msg: string) {
    setError(msg)
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

        <div className="mb-6">
          <OtpInput value={otpValues.join("")} onChange={(val) => { const arr = new Array(6).fill(""); val.split("").forEach((d, i) => { if (i < 6) arr[i] = d }); setOtpValues(arr) }} disabled={otpLoading} />
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
              <button onClick={handleResendOtp} className="text-xs font-medium text-accent-300 hover:text-accent-400">Resend code</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === "userType") {
    return <RegisterUserTypeSelector userType={userType} onChange={setUserType} onNext={() => setStep("form")} error={error} />
  }

  return (
    <form onSubmit={handleSubmit}>
      <RegisterAccountInfo
        contactMethod={contactMethod} password={password} referralCode={referralCode}
        error={error} loading={loading}
        onContactMethodChange={setContactMethod} onPasswordChange={setPassword}
        onReferralCodeChange={setReferralCode} onBack={() => setStep("userType")}
        onGoogleSuccess={handleGoogleSuccess} onGoogleError={handleGoogleError}
      />
    </form>
  )
}
