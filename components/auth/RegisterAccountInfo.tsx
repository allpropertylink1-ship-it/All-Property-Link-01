"use client"

import { ArrowLeft, ArrowRight } from "@/components/ui/icons"
import { PasswordStrength } from "./PasswordStrength"
import { PasswordToggle } from "./PasswordToggle"
import { stitchInputClass } from "./stitch-auth"
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
  onSwitchToLogin?: () => void
}

export function RegisterAccountInfo({
  contactMethod, password, referralCode, firstName, lastName, email, phone, error, loading, acceptedTerms, onAcceptedChange,
  onContactMethodChange, onPasswordChange, onReferralCodeChange,
  onBack, onFirstNameChange, onLastNameChange, onEmailChange, onPhoneChange,
  onSwitchToLogin,
}: Props) {
  return (
    <div className="space-y-3">
      {onBack && (
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-[13px] font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft size={14} /> Back to sign in
        </button>
      )}

      <div className="space-y-3">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="firstName" className="block text-[13px] font-semibold text-text-primary">First name</label>
            <input id="firstName" name="firstName" type="text" required autoComplete="given-name"
              value={firstName} onChange={onFirstNameChange}
              placeholder="Kamau"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-[13px] font-semibold text-text-primary">Last name</label>
            <input id="lastName" name="lastName" type="text" required autoComplete="family-name"
              value={lastName} onChange={onLastNameChange}
              placeholder="Mwangi"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-[13px] font-semibold text-text-primary" id="contact-method-label">Sign up with</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-secondary p-1" role="group" aria-labelledby="contact-method-label">
            <button type="button" onClick={() => onContactMethodChange("email")}
              aria-pressed={contactMethod === "email"}
              className={`rounded-md px-3 py-2 text-[13px] font-semibold transition-all ${
                contactMethod === "email"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}>Email</button>
            <button type="button" onClick={() => onContactMethodChange("phone")}
              aria-pressed={contactMethod === "phone"}
              className={`rounded-md px-3 py-2 text-[13px] font-semibold transition-all ${
                contactMethod === "phone"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}>Phone</button>
          </div>
        </div>

        {contactMethod === "email" ? (
          <div>
            <label htmlFor="email" className="block text-[13px] font-semibold text-text-primary">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              value={email} onChange={onEmailChange}
              className={stitchInputClass}
              style={{ fontSize: "16px" }} placeholder="you@example.co.ke" />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-[13px] font-semibold text-text-primary">Phone</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-lg rounded-r-none border border-r-0 border-border bg-surface-secondary px-2.5 text-[13px] text-text-secondary">+254</span>
              <input id="phone" name="phone" type="tel" inputMode="numeric" required maxLength={9}
                value={phone} onChange={onPhoneChange}
                className="block w-full rounded-lg rounded-l-none border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ fontSize: "16px" }} placeholder="712 345 678" />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-[13px] font-semibold text-text-primary">Password</label>
          <div className="mt-1">
            <PasswordToggle id="password" name="password" value={password} onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="new-password" required minLength={8} placeholder="Min. 8 characters" />
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-text-primary">Confirm password</label>
          <div className="mt-1">
            <PasswordToggle id="confirmPassword" name="confirmPassword" autoComplete="new-password" required minLength={8} placeholder="Repeat password" />
          </div>
        </div>

        <details className="group rounded-lg border border-border bg-surface-secondary/50">
          <summary className="cursor-pointer list-none px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary">
            <span className="group-open:hidden">Have a rep code? <span className="text-primary-600">Add it</span></span>
            <span className="hidden group-open:inline">Hide rep code</span>
          </summary>
          <div className="px-3 pb-2.5">
            <label htmlFor="referralCode" className="block text-[13px] font-semibold text-text-primary">Rep code <span className="font-normal text-text-secondary">(optional)</span></label>
            <input id="referralCode" name="referralCode" type="text" value={referralCode} onChange={(e) => onReferralCodeChange(e.target.value)}
              placeholder="APL-XXX-000"
              className={stitchInputClass}
              style={{ fontSize: "16px" }} />
          </div>
        </details>

        <label htmlFor="acceptedTerms" className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-secondary/50 p-2.5">
          <input
            id="acceptedTerms"
            name="acceptedTerms"
            type="checkbox"
            required
            aria-required="true"
            checked={acceptedTerms}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-[13px] leading-snug text-text-secondary">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Terms</a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Privacy Policy</a>
            {" "}(18+).
          </span>
        </label>

        <button type="submit" disabled={loading} aria-busy={loading}
          className="touch-target flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Creating..." : "Create account"}
          {!loading && <ArrowRight size={16} />}
        </button>

        <p className="text-center text-[13px] text-text-secondary">
          Have an account?{" "}
          {onSwitchToLogin ? (
            <button type="button" onClick={onSwitchToLogin} className="font-semibold text-accent-600 hover:text-accent-700">Sign in</button>
          ) : (
            <a href="/auth/login" className="font-semibold text-accent-600 hover:text-accent-700">Sign in</a>
          )}
        </p>
      </div>
    </div>
  )
}
