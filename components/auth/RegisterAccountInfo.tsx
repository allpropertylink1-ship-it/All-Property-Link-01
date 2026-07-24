"use client"

import { ArrowLeft } from "@/components/ui/icons"
import { PasswordStrength } from "./PasswordStrength"
import { PasswordToggle } from "./PasswordToggle"
import { GoogleSignInButton } from "./GoogleSignInButton"

type ContactMethod = "email" | "phone"

interface Props {
  contactMethod: ContactMethod
  password: string
  referralCode: string
  error: string
  loading: boolean
  onContactMethodChange: (m: ContactMethod) => void
  onPasswordChange: (v: string) => void
  onReferralCodeChange: (v: string) => void
  onBack: () => void
  onGoogleSuccess: () => Promise<void>
  onGoogleError: (msg: string) => void
}

export function RegisterAccountInfo({
  contactMethod, password, referralCode, error, loading,
  onContactMethodChange, onPasswordChange, onReferralCodeChange,
  onBack, onGoogleSuccess, onGoogleError,
}: Props) {
  return (
    <>
      <div className="mb-6">
        <GoogleSignInButton
          mode="signup"
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
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

      <button type="button" onClick={onBack} className="mb-4 flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">First name</label>
            <input id="firstName" name="firstName" type="text" required
              className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }} />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">Last name</label>
            <input id="lastName" name="lastName" type="text" required
              className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Contact method</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => onContactMethodChange("email")}
              className={`flex-1 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                contactMethod === "email"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}>Email</button>
            <button type="button" onClick={() => onContactMethodChange("phone")}
              className={`flex-1 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
                contactMethod === "phone"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}>Phone (+254)</button>
          </div>
        </div>

        {contactMethod === "email" ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }} placeholder="you@example.com" />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">Phone number</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-sm rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">+254</span>
              <input id="phone" name="phone" type="tel" inputMode="numeric" required maxLength={9}
                className="block w-full rounded-sm rounded-l-none border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                style={{ fontSize: "16px" }} placeholder="712 345 678" />
            </div>
            <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">Password</label>
          <div className="mt-1">
            <PasswordToggle id="password" name="password" value={password} onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete="new-password" required minLength={8} />
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirm password</label>
          <div className="mt-1">
            <PasswordToggle id="confirmPassword" name="confirmPassword" autoComplete="new-password" required minLength={8} />
          </div>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-text-primary">Referral Code (optional)</label>
          <input id="referralCode" name="referralCode" type="text" value={referralCode} onChange={(e) => onReferralCodeChange(e.target.value)}
            placeholder="APL-XXX-000-00/00"
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
            style={{ fontSize: "16px" }} />
        </div>

        <button type="submit" disabled={loading}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-accent-300 hover:text-accent-400">Sign in</a>
        </p>
      </div>
    </>
  )
}
