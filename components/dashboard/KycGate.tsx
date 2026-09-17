"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Shield, ShieldX, Clock } from "@/components/ui/icons"

interface KycGateProps {
  children: React.ReactNode
  kycStatus: string | null | undefined
  isAgent?: boolean
  authMethod?: string
  primaryUserType?: string | null
  userTypes?: string[]
}

export function KycGate({ children, kycStatus, isAgent, authMethod, primaryUserType, userTypes }: KycGateProps) {
  const pathname = usePathname()
  const isKycPage = pathname === "/dashboard/kyc" || pathname.startsWith("/dashboard/kyc/")
  const isOnboardingPage = pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding")

  // APL Representatives never do KYC; customers are exempt from verification.
  if (isAgent || authMethod === "agent") return <>{children}</>
  if (primaryUserType === "CUSTOMER") return <>{children}</>
  if (kycStatus === "VERIFIED") return <>{children}</>
  if (isKycPage) return <>{children}</>
  // Account type is chosen AFTER KYC now: typeless users must complete KYC before onboarding
  const isTypeless = !primaryUserType && (!userTypes || userTypes.length === 0)
  if (isTypeless && isOnboardingPage && kycStatus !== "VERIFIED") {
    // Will be caught by the NONE/PENDING blocks below with onboarding-specific CTA
  }

  if (kycStatus === "NONE") {
    const isTypeless = !primaryUserType && (!userTypes || userTypes.length === 0)
    const isOnboardingPage = pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding")
    if (isTypeless && isOnboardingPage) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
          <ShieldX size={64} className="mb-4 text-text-secondary" />
          <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">Verify Your Identity First</h2>
          <p className="mb-6 max-w-md text-sm text-text-secondary">
            Please complete identity verification (KYC) before choosing your account type. Your account type is selected after verification.
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
          You must verify your identity before accessing other features. Please submit your KYC documents.
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

  if (kycStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="alert">
        <ShieldX size={64} className="mb-4 text-error-500" />
        <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">KYC Documents Rejected</h2>
        <p className="mb-6 max-w-md text-sm text-text-secondary">
          Your submitted documents did not meet requirements. Please check the rejection reason and resubmit.
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

  if (kycStatus === "PENDING") {
    const isTypeless = !primaryUserType && (!userTypes || userTypes.length === 0)
    const isOnboardingPage = pathname === "/dashboard/onboarding" || pathname.startsWith("/dashboard/onboarding")
    if (isTypeless && isOnboardingPage) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center" role="status">
          <Clock size={56} className="mb-4 text-warning-500" />
          <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-text-primary">KYC Under Review</h2>
          <p className="mb-6 max-w-md text-sm text-text-secondary">
            Your identity documents are being reviewed. You'll be able to choose your account type once verification is complete.
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
    return (
      <div className="flex flex-col">
        <div className="mx-4 mt-4 flex min-w-0 flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm sm:mx-6 sm:flex-row sm:items-center lg:mx-8" role="status">
          <Clock size={18} className="shrink-0 text-warning-500" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-warning-700">KYC under review</p>
            <p className="text-warning-600">Your identity documents are being verified. Some features are limited until verification is complete.</p>
          </div>
          <Link
            href="/dashboard/kyc"
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white hover:bg-warning-600"
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
