"use client"

import { Home, Handshake, Wrench, Briefcase, User, ShieldAlert, ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"

const userTypeOptions = [
  { value: "PROPERTY_OWNER", label: "Property Owner", description: "I want to list properties for sale or rent", icon: Home },
  { value: "AGENT", label: "Agent", description: "I want to list properties on behalf of clients", icon: Handshake },
  { value: "FUNDI", label: "Fundi", description: "I offer trade services like plumbing, electrical, carpentry", icon: Wrench },
  { value: "SERVICE_PROVIDER", label: "Service Provider", description: "I offer services like cleaning, security, property management", icon: Briefcase },
]

const customerOption = {
  value: "CUSTOMER",
  label: "Customer",
  description: "I want to find properties, rentals and services — and leave reviews",
  icon: User,
}

interface Props {
  userType: string
  onChange: (v: string) => void
  onNext: () => void
  error: string
  /** When set, only this type is shown (e.g. customer-only signup from "Leave a Review"). */
  lockValue?: string
}

export function RegisterUserTypeSelector({ userType, onChange, onNext, error, lockValue }: Props) {
  const options = lockValue
    ? [...userTypeOptions, customerOption].filter((o) => o.value === lockValue)
    : [...userTypeOptions, customerOption]

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Account Classification
        </p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-text-primary">Create Your Account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {lockValue ? "Confirm the account type to continue." : "Select the account type that best describes you."}
        </p>
      </div>
      <p className="flex items-start gap-2 rounded-lg bg-warning-50 px-3 py-2 text-xs font-medium text-warning-700">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        This choice is permanent and cannot be changed.
      </p>

      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}

      <div className="grid gap-2.5" role="radiogroup" aria-label="Account type">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={userType === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all touch-target ${
              userType === opt.value
                ? "border-primary bg-primary-50"
                : "border-border hover:border-primary"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${userType === opt.value ? "bg-primary text-white" : "bg-surface-secondary text-text-secondary"}`}>
              <opt.icon size={20} />
            </span>
            <span>
              <span className="block font-semibold text-text-primary">{opt.label}</span>
              <span className="block text-sm text-text-secondary">{opt.description}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!userType}
        aria-busy={false}
        className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </div>
  )
}
