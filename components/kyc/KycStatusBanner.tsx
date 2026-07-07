"use client"

import { Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-muted", bg: "bg-gray-50", border: "border-muted/30" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
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
    <div className={cn("rounded-xl border p-5 transition-all", cfg.bg, cfg.border)}>
      <div className="flex items-start gap-4">
        <cfg.icon size={28} className={cn("shrink-0 mt-0.5", cfg.color)} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground">
            Identity Verification (KYC)
            <span className="ml-3">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
                <cfg.icon size={12} />
                {cfg.label}
              </span>
            </span>
          </h1>
          <p className={cn("mt-1 text-sm", status === "REJECTED" ? "text-red-700" : status === "PENDING" ? "text-amber-700" : status === "VERIFIED" ? "text-green-700" : "text-muted")}>
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
    </div>
  )
}