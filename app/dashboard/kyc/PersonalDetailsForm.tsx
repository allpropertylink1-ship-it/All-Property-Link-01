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
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Personal Details <span className="text-sm font-normal text-muted">(as they appear on your ID)</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">First Name <span className="text-red-500">*</span></label>
          <input value={bioFirstName} onChange={e => onChange("bioFirstName", e.target.value)} placeholder="e.g. John"
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Middle Name <span className="text-xs text-muted">(optional)</span></label>
          <input value={bioMiddleName} onChange={e => onChange("bioMiddleName", e.target.value)} placeholder="e.g. Michael"
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Last Name <span className="text-red-500">*</span></label>
          <input value={bioLastName} onChange={e => onChange("bioLastName", e.target.value)} placeholder="e.g. Doe"
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Phone Number <span className="text-red-500">*</span>
            {userPhone && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
                <Lock size={10} /> Verified from account
              </span>
            )}
          </label>
          <input value={bioPhone} onChange={e => onChange("bioPhone", e.target.value)} type="tel" placeholder="e.g. +254 712 345 678"
            readOnly={!!(userPhone && bioPhone === userPhone)}
            className={cn(
              "block w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
              userPhone && bioPhone === userPhone
                ? "border-teal-200 bg-teal-50/50 text-teal-800 cursor-not-allowed"
                : "border-input bg-background focus:ring-2 focus:ring-primary/50"
            )} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Email <span className="text-xs text-muted">(optional)</span></label>
          <input value={bioEmail} onChange={e => onChange("bioEmail", e.target.value)} type="email" placeholder="e.g. john@example.com"
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>
    </div>
  )
}
