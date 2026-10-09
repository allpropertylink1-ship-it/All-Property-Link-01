"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Shield, ShieldX, Clock } from "@/components/ui/icons"

interface KycGateProps {
  children: React.ReactNode
  kycStatus: string | null | undefined
  authMethod?: string
  primaryUserType?: string | null
  userTypes?: string[]
}

export function KycGate({ children, kycStatus, authMethod, primaryUserType, userTypes }: KycGateProps) {
  const pathname = usePathname()
  const isKycPage = pathname === "/dashboard/kyc" || pathname.startsWith("/dashboard/kyc/")
  const isOnboardingPage = pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding")
  const isChooseRolePage = pathname === "/dashboard/choose-role" || pathname.startsWith("/dashboard/choose-role")

  // Only true APL Representative sessions skip KYC (authMethod === "agent").
  // NOTE: the session `isAgent` flag is NOT sufficient — the backend sets it
  // for any user linked to a rep (aplAgentId != null), so referred-but-
  // unverified advertisers must still pass through the gates below.
  // Customers are exempt from verification (limited pages only).
  if (authMethod === "agent") return <>{children}</>
  if (primaryUserType === "CUSTOMER") return <>{children}</>
  if (kycStatus === "VERIFIED") return <>{children}</>
  if (isKycPage) return <>{children}</>
  // Role choice precedes everything: typeless users must pass through
  // /dashboard/choose-role before KYC or onboarding gates apply.
  if (isChooseRolePage) return <>{children}</>
  // Missing/unknown status means never submitted — treat as NONE so there
  // is no bypass for users without a kycStatus on the session.
  const effectiveStatus = kycStatus ?? "NONE"
  // Account type is chosen AFTER KYC now: typeless users must complete KYC before onboarding
  const isTypeless = !primaryUserType && (!userTypes || userTypes.length === 0)
  if (isTypeless && isOnboardingPage && kycStatus !== "VERIFIED") {
    // Will be caught by the NONE/PENDING blocks below with onboarding-specific CTA
  }

  if (effectiveStatus === "NONE") {
    const isTypeless = !primaryUserType && (!userTypes || userTypes.length === 0)
    const isOnboardingPage = pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding")
    if (isTypeless && isOnboardingPage) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
          <ShieldX size={64} className="mb-4 text-text-secondary" />
          <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">Verify Your Identity First</h2>
          <p className="mb-6 max-w-md text-sm text-text-secondary">
            Please complete identity verification (KYC) to continue.
          </p>
          <Link
            href="/dashboard/kyc"
            className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Shield size={18} />
            Complete KYC Verification
          </Link>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
        <ShieldX size={64} className="mb-4 text-text-secondary" />
          <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">Identity Verification Required</h2>
          <p className="mb-6 max-w-md text-sm text-text-secondary">
            Complete KYC verification and approval to access the rest of your dashboard,
            including your Business Profile and Personal Profile.
          </p>
        <Link
          href="/dashboard/kyc"
          className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Shield size={18} />
          Complete KYC Verification
        </Link>
      </div>
    )
  }

  if (effectiveStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
        <ShieldX size={64} className="mb-4 text-error-500" />
          <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">KYC Documents Rejected</h2>
          <p className="mb-6 max-w-md text-sm text-text-secondary">
            Your submitted documents were not approved. Complete KYC verification and
            approval to access the rest of your dashboard — please check the
            rejection reason and resubmit.
          </p>
        <Link
          href="/dashboard/kyc"
          className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-error-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-error-700"
        >
          <Shield size={18} />
          Resubmit KYC Documents
        </Link>
      </div>
    )
  }

  if (effectiveStatus === "PENDING") {
    // Pending approval blocks the rest of the dashboard — including
    // Personal/Business profile, listings, services, reviews and
    // notifications — until an admin approves the KYC documents.
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="status">
        <Clock size={64} className="mb-4 text-warning-500" />
        <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">KYC Verification Pending Approval</h2>
        <p className="mb-6 max-w-md text-sm text-text-secondary">
          Complete KYC verification and approval to access the rest of your dashboard.
          Your documents are under review — we will unlock your Business Profile,
          Personal Profile and all other sections once approved.
        </p>
        <Link
          href="/dashboard/kyc"
          className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-warning-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-warning-600"
        >
          <Clock size={18} />
          View KYC Status
        </Link>
      </div>
    )
  }

  // Fallback: any other non-verified status blocks like NONE.
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
      <ShieldX size={64} className="mb-4 text-text-secondary" />
      <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">Identity Verification Required</h2>
      <p className="mb-6 max-w-md text-sm text-text-secondary">
        Complete KYC verification and approval to access the rest of your dashboard.
      </p>
      <Link
        href="/dashboard/kyc"
        className="touch-target inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        <Shield size={18} />
        Complete KYC Verification
      </Link>
    </div>
  )
}
