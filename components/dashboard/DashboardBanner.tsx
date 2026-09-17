import Link from "next/link";
import { Clock, XCircle, ShieldAlert } from "@/components/ui/icons";

interface DashboardBannerProps {
  accountStatus: string;
  onboardingComplete: boolean;
  kycStatus: string;
  isAgent?: boolean;
  authMethod?: string;
  primaryUserType?: string | null;
}

export function DashboardBanner({ accountStatus, onboardingComplete, kycStatus, isAgent, authMethod, primaryUserType }: DashboardBannerProps) {
  if (isAgent || authMethod === "agent") return null;
  if (primaryUserType === "CUSTOMER") return null;
  if (kycStatus === "VERIFIED" && accountStatus === "ACTIVE" && onboardingComplete) return null;
  if (kycStatus === "PENDING" && !primaryUserType) return null; // typeless pending shows KycGate status instead

  if (kycStatus === "NONE" || kycStatus === "REJECTED") {
    const isTypeless = !primaryUserType
    return (
      <div className="px-4 pt-4 sm:px-6 lg:px-8" role="alert">
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm sm:flex-row sm:items-center">
          <ShieldAlert size={18} className="shrink-0 text-error-500" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-error-700">
              {kycStatus === "NONE" ? "Identity verification required" : "Identity verification rejected"}
            </p>
            <p className="text-error-600">
              {kycStatus === "NONE"
                ? isTypeless
                  ? "Complete identity verification to continue."
                  : "Complete identity verification first before setting up your business profile."
                : "Your identity documents were not approved. Please resubmit."}
            </p>
          </div>
          <Link
            href="/dashboard/kyc"
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
          >
            {kycStatus === "NONE" ? "Verify identity" : "Resubmit documents"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      {accountStatus === "PENDING_APPROVAL" && (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm sm:flex-row sm:items-center" role="status">
          <Clock size={18} className="shrink-0 text-warning-500" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-warning-700">Account pending approval</p>
            <p className="text-warning-600">
              {onboardingComplete
                ? "Your information has been submitted. An admin will review and activate your account shortly."
                : "Please complete your business profile to submit for admin approval."}
            </p>
          </div>
          {!onboardingComplete && (
            <Link
              href="/dashboard/onboarding"
              className="touch-target inline-flex shrink-0 items-center justify-center rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white hover:bg-warning-600"
            >
              Complete profile
            </Link>
          )}
        </div>
      )}

      {accountStatus === "REJECTED" && (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm sm:flex-row sm:items-center" role="alert">
          <XCircle size={18} className="shrink-0 text-error-500" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-error-700">Account not approved</p>
            <p className="text-error-600">
              Your registration was not approved. Please contact support or update your information.
            </p>
          </div>
          <Link
            href="/dashboard/onboarding"
            className="touch-target inline-flex shrink-0 items-center justify-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
          >
            Update & resubmit
          </Link>
        </div>
      )}
    </div>
  );
}
