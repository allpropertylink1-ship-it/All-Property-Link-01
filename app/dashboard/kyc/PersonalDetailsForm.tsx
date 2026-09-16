"use client"

import { Lock } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface Props {
  bioFirstName: string
  bioMiddleName: string
  bioLastName: string
  bioPhone: string
  bioEmail: string
  userPhone?: string
  onChange: (field: string, value: string) => void
}

export function PersonalDetailsForm({ bioFirstName, bioMiddleName, bioLastName, bioPhone, bioEmail, userPhone, onChange }: Props) {
  return (
    <section aria-labelledby="kyc-personal-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="kyc-personal-heading" className="font-heading text-base font-semibold text-text-primary">
        Personal Details
      </h2>
      <p className="mb-4 mt-0.5 text-sm text-text-secondary">As they appear on your ID.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="bioFirstName">First Name <span className="text-error-500">*</span></label>
          <input id="bioFirstName" value={bioFirstName} onChange={e => onChange("bioFirstName", e.target.value)} placeholder="e.g. John"
            className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="bioMiddleName">Middle Name <span className="text-xs font-normal text-text-secondary">(optional)</span></label>
          <input id="bioMiddleName" value={bioMiddleName} onChange={e => onChange("bioMiddleName", e.target.value)} placeholder="e.g. Michael"
            className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="bioLastName">Last Name <span className="text-error-500">*</span></label>
          <input id="bioLastName" value={bioLastName} onChange={e => onChange("bioLastName", e.target.value)} placeholder="e.g. Doe"
            className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="bioPhone">
            Phone Number <span className="text-error-500">*</span>
            {userPhone && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                <Lock size={10} /> Verified from account
              </span>
            )}
          </label>
          <input id="bioPhone" value={bioPhone} onChange={e => onChange("bioPhone", e.target.value)} type="tel" placeholder="e.g. +254 712 345 678"
            readOnly={!!(userPhone && bioPhone === userPhone)}
            className={cn(
              "block min-h-[44px] w-full rounded-lg border px-3 py-2 text-base outline-none transition-colors",
              userPhone && bioPhone === userPhone
                ? "border-primary-200 bg-primary-50/50 text-primary-800 cursor-not-allowed"
                : "border-border bg-surface focus:ring-2 focus:ring-primary-600/20"
            )} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="bioEmail">Email <span className="text-xs font-normal text-text-secondary">(optional)</span></label>
          <input id="bioEmail" value={bioEmail} onChange={e => onChange("bioEmail", e.target.value)} type="email" placeholder="e.g. john@example.com"
            className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20" />
        </div>
      </div>
    </section>
  )
}
