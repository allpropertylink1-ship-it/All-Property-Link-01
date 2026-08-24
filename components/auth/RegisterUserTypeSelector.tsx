"use client"

import { Home, Handshake, Wrench, Briefcase, User } from "@/components/ui/icons"
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
  description: "I want to find properties, rentals & services — and leave reviews",
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
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-bold text-text-primary">Choose your account type</h2>
      <p className="text-sm text-text-secondary">
        {lockValue ? "Confirm the account type to continue." : "Select the type of account that best describes you."}
      </p>

      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}

      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-4 rounded-xl border-2 p-3 text-left transition-all ${
              userType === opt.value
                ? "border-accent-300 bg-accent-300/10"
                : "border-border hover:border-accent-300"
            }`}
          >
            <opt.icon size={20} className={userType === opt.value ? "text-accent-300" : "text-text-secondary"} />
            <div>
              <p className="font-medium text-text-primary">{opt.label}</p>
              <p className="text-sm text-text-secondary">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!userType}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}
