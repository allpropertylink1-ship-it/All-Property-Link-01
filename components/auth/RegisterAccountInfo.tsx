"use client"

import { ArrowLeft, ArrowRight } from "@/components/ui/icons"
import { PasswordStrength } from "./PasswordStrength"
import { PasswordToggle } from "./PasswordToggle"
import { GoogleSignInButton } from "./GoogleSignInButton"
import { AuthDivider, stitchInputClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"

type ContactMethod = "email" | "phone"

interface Props {
  contactMethod: ContactMethod
  password: string
  referralCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  error: string
  loading: boolean
  acceptedTerms: boolean
  onAcceptedChange: (v: boolean) => void
  onContactMethodChange: (m: ContactMethod) => void
  onPasswordChange: (v: string) => void
  onReferralCodeChange: (v: string) => void
  onBack?: () => void
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGoogleSuccess: () => Promise<void>
  onGoogleError: (msg: string) => void
  onSwitchToLogin?: () => void
}

export function RegisterAccountInfo({
  contactMethod, password, referralCode, firstName, lastName, email, phone, error, loading, acceptedTerms, onAcceptedChange,
  onContactMethodChange, onPasswordChange, onReferralCodeChange,
  onBack, onFirstNameChange, onLastNameChange, onEmailChange, onPhoneChange,
  onGoogleSuccess, onGoogleError, onSwitchToLogin,
}: Props) {
  return (
    <div className="space-y-4">
      <GoogleSignInButton
        mode="signup"
        termsAccepted={acceptedTerms}
        onSuccess={onGoogleSuccess}
        onError={onGoogleError}
      />

      <AuthDivider label="or register with credentials" />

      {onBack && (
        <button type="button" onClick={onBack} className="flex touch-target items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft size={16} /> Back to Sign In
        </button>
      )}

      <div className="space-y-4">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}

        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-text-primary">Full Names <span className="text-text-secondary">(First)</span></label>
            <input id="firstName" name="firstName" type="text" required autoComplete="given-name"
              value={firstName} onChange={onFirstNameChange}
              aria-label="First name"
              placeholder="e.g. Kamau"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-text-primary">Full Names <span className="text-text-secondary">(Last)</span></label>
            <input id="lastName" name="lastName" type="text" required autoComplete="family-name"
              value={lastName} onChange={onLastNameChange}
              aria-label="Last name"
              placeholder="e.g. Mwangi"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-text-primary" id="contact-method-label">Contact method</span>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-secondary p-1.5" role="group" aria-labelledby="contact-method-label">
            <button type="button" onClick={() => onContactMethodChange("email")}
              aria-pressed={contactMethod === "email"}
              className={`touch-target rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                contactMethod === "email"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}>Email</button>
            <button type="button" onClick={() => onContactMethodChange("phone")}
              aria-pressed={contactMethod === "phone"}
              className={`touch-target rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                contactMethod === "phone"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}>Phone (+254)</button>
          </div>
        </div>

        {contactMethod === "email" ? (
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-primary">Email Address</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              value={email} onChange={onEmailChange}
              aria-label="Email Address"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} placeholder="you@example.com" />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-text-primary">Phone number</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-xl rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">+254</span>
              <input id="phone" name="phone" type="tel" inputMode="numeric" required maxLength={9}
                value={phone} onChange={onPhoneChange}
                aria-label="Phone number, last 9 digits"
                className="block w-full rounded-xl rounded-l-none border border-border bg-surface-secondary px-4 py-3.5 text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }} placeholder="712 345 678" />
            </div>
            <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-text-primary">Password</label>
          <div className="mt-1">
            <PasswordToggle id="password" name="password" value={password} onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="new-password" required minLength={8} placeholder="Create a strong password" />
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary">Confirm password</label>
          <div className="mt-1">
            <PasswordToggle id="confirmPassword" name="confirmPassword" autoComplete="new-password" required minLength={8} placeholder="Re-enter your password" />
          </div>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-semibold text-text-primary">APL Rep Code <span className="font-normal text-text-secondary">(Optional)</span></label>
          <input id="referralCode" name="referralCode" type="text" value={referralCode} onChange={(e) => onReferralCodeChange(e.target.value)}
            placeholder="e.g. APL-XXX-000-00/00"
            aria-label="Referral Code, optional"
            className={stitchInputClass}
            style={{ fontSize: "16px" }} />
          <p className="mt-1 text-xs text-text-secondary">Enter the code provided by your APL Property Link agent, if any.</p>
        </div>

        <label htmlFor="acceptedTerms" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-secondary/50 p-3.5">
          <input
            id="acceptedTerms"
            name="acceptedTerms"
            type="checkbox"
            required
            aria-required="true"
            checked={acceptedTerms}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-sm leading-5 text-text-secondary">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Privacy Policy</a>.
            {" "}I confirm I am 18+ years old.
          </span>
        </label>

        <button type="submit" disabled={loading} aria-busy={loading}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Creating account..." : "Create Account and Continue to Verification"}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          {onSwitchToLogin ? (
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-accent-600 hover:text-accent-700">Sign In</button>
          ) : (
            <a href="/auth/login" className="font-semibold text-accent-600 hover:text-accent-700">Sign In</a>
          )}
        </p>
      </div>
    </div>
  )
}
