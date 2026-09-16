"use client"

import { Shield, CheckCircle, XCircle, Clock } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-text-secondary", bg: "bg-surface-secondary", border: "border-border" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-warning-600", bg: "bg-warning-50", border: "border-warning-200" },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-success-600", bg: "bg-success-50", border: "border-success-500/30" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-error-600", bg: "bg-error-50", border: "border-error-200" },
}

const statusMessages: Record<string, string> = {
  NONE: "Verify your identity to unlock all platform features. Submit your ID document to get started.",
  PENDING: "Your documents are under review. An admin will verify them shortly. You can still use other dashboard features.",
  VERIFIED: "Your identity has been verified. You can now list properties and use all platform features.",
  REJECTED: "Your documents were not approved. Please correct the issues and re-submit below.",
}

interface KycStatusBannerProps {
  status: string
  rejectionReason?: string | null
}

export default function KycStatusBanner({ status, rejectionReason }: KycStatusBannerProps) {
  const cfg = statusConfig[status]
  if (!cfg) return null

  return (
    <section aria-label={`KYC status: ${cfg.label}`} className={cn("rounded-xl border p-5 transition-all", cfg.bg, cfg.border)}>
      <div className="flex items-start gap-4">
        <cfg.icon size={28} className={cn("shrink-0 mt-0.5", cfg.color)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-bold tracking-tight text-text-primary">
            Identity Verification (KYC)
            <span className="ml-3">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
                <cfg.icon size={12} aria-hidden="true" />
                {cfg.label}
              </span>
            </span>
          </h1>
          <p className={cn("mt-1 text-sm", status === "REJECTED" ? "text-error-600" : status === "PENDING" ? "text-warning-700" : status === "VERIFIED" ? "text-success-700" : "text-text-secondary")}>
            {rejectionReason ? (
              <>
                {statusMessages[status]}
                <p className="mt-1 font-medium">Reason: {rejectionReason}</p>
              </>
            ) : (
              statusMessages[status]
            )}
          </p>
        </div>
      </div>
    </section>
  )
}