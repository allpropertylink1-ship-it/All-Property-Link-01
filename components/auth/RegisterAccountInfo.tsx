"use client"

import { ArrowLeft } from "@/components/ui/icons"
import { PasswordStrength } from "./PasswordStrength"
import { PasswordToggle } from "./PasswordToggle"
import { FormBanner } from "@/components/shared/FormFeedback"
import { InlineInput } from "./InlineInput"
import { Select, type SelectOption } from "./Select"
import Link from "next/link"

type ContactMethod = "email" | "phone"

interface Props {
  contactMethod: ContactMethod
  password: string
  referralCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  recoveryEmail: string
  accountType: string
  error: string
  errorField?: "email" | "recoveryEmail" | null
  loading: boolean
  acceptedTerms: boolean
  onAcceptedChange: (v: boolean) => void
  onContactMethodChange: (m: ContactMethod) => void
  onAccountTypeChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onReferralCodeChange: (v: string) => void
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRecoveryEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  returnUrl?: string
}

const accountOptions = [
  { value: "PROPERTY_OWNER", label: "Property Owner", hint: "List your own property" },
  { value: "AGENT", label: "Agent", hint: "List for owners" },
  { value: "SERVICE_PROVIDER", label: "Service Provider", hint: "Fundi, cleaning, security & more" },
  { value: "CUSTOMER", label: "Customer", hint: "Rent, buy & browse" },
] as const satisfies SelectOption[]

export function RegisterAccountInfo({
  contactMethod,
  password,
  referralCode,
  firstName,
  lastName,
  email,
  phone,
  recoveryEmail,
  accountType,
  error,
  errorField = null,
  loading,
  acceptedTerms,
  onAcceptedChange,
  onContactMethodChange,
  onAccountTypeChange,
  onPasswordChange,
  onReferralCodeChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onRecoveryEmailChange,
  returnUrl,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Back link - simplified to text link */}
      <Link
        href={`/auth/login${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ""}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to sign in
      </Link>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      {/* First name / Last name - inline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InlineInput
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
        <InlineInput
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

      {/* Account type - dropdown select */}
      <Select
        label="I am joining as"
        required
        options={accountOptions}
        value={accountType}
        onChange={onAccountTypeChange}
        placeholder="Select account type"
        error={!accountType ? "Please select your account type" : undefined}
      />

      {/* Contact method - email/phone toggle */}
      <div className="space-y-1.5">
        <label className={cn("block text-xs font-semibold text-text-primary", "text-error-500")}>
          Sign up with <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-secondary p-1" role="group" aria-label="Contact method">
          <button
            type="button"
            onClick={() => onContactMethodChange("email")}
            aria-pressed={contactMethod === "email"}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              contactMethod === "email"
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => onContactMethodChange("phone")}
            aria-pressed={contactMethod === "phone"}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              contactMethod === "phone"
                ? "bg-surface text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            Phone
          </button>
        </div>
      </div>

      {/* Email or Phone fields */}
      {contactMethod === "email" ? (
        <InlineInput
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
          leadingIcon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>}
        />
      ) : (
        <>
          <InlineInput
            label="Phone"
            required
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={12}
            value={phone}
            onChange={onPhoneChange}
            placeholder="712345678 or 0112345678"
            leadingIcon={<span className="text-text-secondary">+254</span>}
            error={errorField === "recoveryEmail" ? error : undefined}
          />
          <InlineInput
            label="Recovery email"
            id="recoveryEmail"
            name="recoveryEmail"
            type="email"
            autoComplete="email"
            value={recoveryEmail}
            onChange={onRecoveryEmailChange}
            placeholder="you@example.co.ke"
            hint="Recommended — your way back in if you lose this number"
            error={errorField === "recoveryEmail" ? error : undefined}
            leadingIcon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>}
          />
        </>
      )}

      {/* Password */}
      <InlineInput
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
          />
        }
      />
      <div className="sm:pl-[152px]">
        <PasswordStrength password={password} />
      </div>

      {/* Confirm password */}
      <InlineInput
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
          />
        }
      />

      {/* Referral code - collapsible */}
      <details className="group rounded-lg border border-border bg-surface-secondary/50">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary">
          <span className="group-open:hidden">Have a rep code? <span className="text-primary-600">Add it</span></span>
          <span className="hidden group-open:inline">Hide rep code</span>
        </summary>
        <div className="px-3 pb-3">
          <InlineInput
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
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Privacy Policy</a>
          {" "}(18+).
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="touch-target flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}