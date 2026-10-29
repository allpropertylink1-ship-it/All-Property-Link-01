"use client"

import { ArrowLeft } from "@/components/ui/icons"
import { PasswordToggle } from "./PasswordToggle"
import { FormBanner } from "@/components/shared/FormFeedback"
import { AuthInput } from "./AuthInput"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Props {
  password: string
  referralCode: string
  firstName: string
  lastName: string
  email: string
  error: string
  errorField?: "email" | null
  loading: boolean
  acceptedTerms: boolean
  onAcceptedChange: (v: boolean) => void
  onPasswordChange: (v: string) => void
  onReferralCodeChange: (v: string) => void
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  returnUrl?: string
}

export function RegisterAccountInfo({
  password,
  referralCode,
  firstName,
  lastName,
  email,
  error,
  errorField = null,
  loading,
  acceptedTerms,
  onAcceptedChange,
  onPasswordChange,
  onReferralCodeChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  returnUrl,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href={`/auth/login${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ""}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to sign in
      </Link>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      {/* First name / Last name - inline on wider screens, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AuthInput
          label="First name"
          required
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={onFirstNameChange}
          placeholder="Kamau"
          error={errorField === "email" ? error : undefined}
        />
        <AuthInput
          label="Last name"
          required
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={onLastNameChange}
          placeholder="Mwangi"
        />
      </div>

      {/* Email */}
      <AuthInput
        label="Email"
        required
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={onEmailChange}
        placeholder="you@example.co.ke"
        error={errorField === "email" ? error : undefined}
        leadingIcon={
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="m22 6-10 7L2 6" />
          </svg>
        }
      />

      {/* Password */}
      <AuthInput
        label="Password"
        required
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="Min. 8 characters"
        trailingIcon={
          <PasswordToggle
            id="password"
            name="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            asTrailingIcon
          />
        }
      />

      {/* Confirm password */}
      <AuthInput
        label="Confirm password"
        required
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat password"
        trailingIcon={
          <PasswordToggle
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            asTrailingIcon
          />
        }
      />

      {/* Referral code - optional, collapsible */}
      <details className="group rounded-lg border border-border bg-surface-secondary/50">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary">
          <span className="group-open:hidden">Have a rep code? <span className="text-primary-600">Add it</span></span>
          <span className="hidden group-open:inline">Hide rep code</span>
        </summary>
        <div className="px-3 pb-3">
          <AuthInput
            label="Rep code"
            id="referralCode"
            name="referralCode"
            type="text"
            value={referralCode}
            onChange={(e) => onReferralCodeChange(e.target.value)}
            placeholder="APL-XXX-000"
            hint="Optional"
          />
        </div>
      </details>

      {/* Terms checkbox */}
      <label htmlFor="acceptedTerms" className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-secondary/50 p-2">
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
        <span className="text-xs leading-snug text-text-secondary">
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 underline-offset-2 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 underline-offset-2 hover:underline">
            Privacy Policy
          </a>{" "}
          (18+).
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className={cn(
          "touch-target flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </div>
  )
}
