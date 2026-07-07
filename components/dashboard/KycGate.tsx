"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Shield, ShieldX, Clock } from "lucide-react"

interface KycGateProps {
  children: React.ReactNode
  kycStatus: string | null | undefined
}

export function KycGate({ children, kycStatus }: KycGateProps) {
  const pathname = usePathname()
  const isKycPage = pathname === "/dashboard/kyc" || pathname.startsWith("/dashboard/kyc/")

  if (kycStatus === "VERIFIED") return <>{children}</>
  if (isKycPage) return <>{children}</>

  if (kycStatus === "NONE") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <ShieldX size={64} className="mb-4 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold text-foreground">Identity Verification Required</h2>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          You must verify your identity before accessing other features. Please submit your KYC documents.
        </p>
        <Link
          href="/dashboard/kyc"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Shield size={18} />
          Complete KYC Verification
        </Link>
      </div>
    )
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <ShieldX size={64} className="mb-4 text-error-500" />
        <h2 className="mb-2 text-xl font-bold text-foreground">KYC Documents Rejected</h2>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Your submitted documents did not meet requirements. Please check the rejection reason and resubmit.
        </p>
        <Link
          href="/dashboard/kyc"
          className="inline-flex items-center gap-2 rounded-lg bg-error px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-error/90"
        >
          <Shield size={18} />
          Resubmit KYC Documents
        </Link>
      </div>
    )
  }

  if (kycStatus === "PENDING") {
    return (
      <div className="flex flex-col">
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm lg:mx-8">
          <Clock size={18} className="shrink-0 text-warning-500" />
          <div className="flex-1">
            <p className="font-medium text-warning-700">KYC under review</p>
            <p className="text-warning-600">Your identity documents are being verified. Some features are limited until verification is complete.</p>
          </div>
          <Link
            href="/dashboard/kyc"
            className="shrink-0 rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white hover:bg-warning-600"
          >
            View status
          </Link>
        </div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}
