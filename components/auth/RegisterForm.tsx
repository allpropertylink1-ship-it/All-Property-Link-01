"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type OtpResponse } from "@/lib/auth-context"
import { OtpInput } from "./OtpInput"
import { RegisterAccountInfo } from "./RegisterAccountInfo"
import { formatTime } from "./RegisterForm.utils"
import { FormBanner } from "@/components/shared/FormFeedback"
import { resolvePostAuthTarget } from "@/lib/persona"

type ContactMethod = "email" | "phone"
type Step = "form" | "otp"

export function RegisterForm({ referralCode: initialReferralCode, onSwitchToLogin, returnUrl }: { referralCode?: string; onSwitchToLogin?: () => void; returnUrl?: string }) {
  const router = useRouter()
  const { signup, sendOtp, verifyOtp, updateRegistration } = useAuth()
  const [step, setStep] = useState<Step>("form")
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

  // Preserve form data when navigating between steps
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

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
    const phoneRaw = contactMethod === "phone" ? (form.get("phone") as string) : ""

    // Use state values for all fields (preserved across steps)
    const firstNameValue = firstName
    const lastNameValue = lastName
    const emailValue = email
    const phoneValue = phone

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
      if (!emailValue) {
        setError("Email is required")
        setLoading(false)
        return
      }
    }

    if (!firstNameValue || !lastNameValue) {
      setError("First name and last name are required")
      setLoading(false)
      return
    }

    if (!acceptedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy and confirm you are 18+ years old.")
      setLoading(false)
      return
    }

    let result: { error?: string; otp?: OtpResponse }

    if (otpIdentifier) {
      result = await updateRegistration({
        oldIdentifier: otpIdentifier,
        ...(emailValue ? { email: emailValue } : {}),
        ...(phoneValue ? { phone: phoneValue } : {}),
        firstName: firstNameValue, lastName: lastNameValue,
      })
    } else {
      result = await signup({ firstName: firstNameValue, lastName: lastNameValue, password, email: emailValue, phone: phoneValue, referralCode: referralCode || undefined, acceptedTerms: true, ageConfirmed: true })
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
    if (!otpIdentifier || !otpType) {
      setError("Verification session expired. Please request a new code.")
      setOtpLoading(false)
      return
    }
    setOtpLoading(true)
    setError("")

    const { error: verifyError, user: verifiedUser } = await verifyOtp(otpIdentifier, code, otpType)
    if (verifyError) {
      setError(verifyError)
      setOtpLoading(false)
      return
    }

    setOtpLoading(false)
    router.push(resolvePostAuthTarget(verifiedUser ?? null, returnUrl))
  }

  async function handleResendOtp() {
    if (cooldown > 0) return
    if (!otpIdentifier || !otpType) {
      setError("Verification session expired. Please request a new code.")
      return
    }
    setError("")
    const { error: sendError } = await sendOtp(otpIdentifier, otpType)
    if (sendError) {
      setError(sendError)
      return
    }
    startCooldown(60)
    setOtpValues(["", "", "", "", "", ""])
  }

  if (step === "otp") {
    const isEmail = otpType === "EMAIL_VERIFICATION"
    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <h2 className="mt-3 font-heading text-xl font-bold tracking-tight text-text-primary">Verify Your {isEmail ? "Email Address" : "Phone Number"}</h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            We sent a 6-digit confirmation code to <strong className="break-all text-text-primary">{otpDestination}</strong>
            <button
              type="button"
              onClick={() => { setStep("form"); setOtpValues(["", "", "", "", "", ""]) }}
              className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700"
            >
              Edit
            </button>
          </p>
        </div>

        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}

        <OtpInput value={otpValues.join("")} onChange={(val) => { const arr = new Array(6).fill(""); val.split("").forEach((d, i) => { if (i < 6) arr[i] = d }); setOtpValues(arr) }} disabled={otpLoading} />

        <div className="flex items-center justify-between text-xs">
          {otpExpiresIn > 0 ? (
            <span className="text-text-secondary">Code expires in {formatTime(otpExpiresIn)}</span>
          ) : (
            <span className="font-medium text-error-500">Code expired. Request a new one.</span>
          )}
          {cooldown > 0 ? (
            <span className="text-text-secondary">Resend code in {formatTime(cooldown)}</span>
          ) : (
            <button type="button" onClick={handleResendOtp} className="font-semibold text-accent-600 hover:text-accent-700">Resend Code</button>
          )}
        </div>

        <button
          type="button"
          onClick={handleOtpVerify}
          disabled={otpLoading || otpValues.join("").length !== 6}
          aria-busy={otpLoading}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {otpLoading ? "Verifying..." : "Verify and Complete Registration"}
        </button>
      </div>
    )
  }

  // Wrapper functions to convert ChangeEvent to string for setState
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)

  return (
    <form onSubmit={handleSubmit}>
      <RegisterAccountInfo
        contactMethod={contactMethod} password={password} referralCode={referralCode}
        firstName={firstName} lastName={lastName} email={email} phone={phone}
        error={error} loading={loading} acceptedTerms={acceptedTerms} onAcceptedChange={setAcceptedTerms}
        onContactMethodChange={setContactMethod} onPasswordChange={setPassword}
        onReferralCodeChange={setReferralCode} onBack={onSwitchToLogin ? () => onSwitchToLogin() : undefined}
        onFirstNameChange={handleFirstNameChange} onLastNameChange={handleLastNameChange}
        onEmailChange={handleEmailChange} onPhoneChange={handlePhoneChange}
        onSwitchToLogin={onSwitchToLogin}
      />
    </form>
  )
}
