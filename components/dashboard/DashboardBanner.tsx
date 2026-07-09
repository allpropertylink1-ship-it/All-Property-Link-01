import Link from "next/link";
import { Clock, XCircle, ShieldAlert } from "lucide-react";

interface DashboardBannerProps {
  accountStatus: string;
  onboardingComplete: boolean;
  kycStatus: string;
}

export function DashboardBanner({ accountStatus, onboardingComplete, kycStatus }: DashboardBannerProps) {
  if (accountStatus === "ACTIVE" && (kycStatus === "VERIFIED" || kycStatus === "PENDING")) return null;

  if (kycStatus === "NONE" || kycStatus === "REJECTED") {
    return (
      <div className="px-6 pt-4 lg:px-8">
        <div className="flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm">
          <ShieldAlert size={18} className="shrink-0 text-error-500" />
          <div className="flex-1">
            <p className="font-medium text-error-700">
              {kycStatus === "NONE" ? "Identity verification required" : "Identity verification rejected"}
            </p>
            <p className="text-error-600">
              {kycStatus === "NONE"
                ? "Complete identity verification first before setting up your business profile."
                : "Your identity documents were not approved. Please resubmit."}
            </p>
          </div>
          <Link
            href="/dashboard/kyc"
            className="shrink-0 rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
          >
            {kycStatus === "NONE" ? "Verify identity" : "Resubmit documents"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 lg:px-8">
      {accountStatus === "PENDING_APPROVAL" && (
        <div className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm">
          <Clock size={18} className="shrink-0 text-warning-500" />
          <div className="flex-1">
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
              className="shrink-0 rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white hover:bg-warning-600"
            >
              Complete profile
            </Link>
          )}
        </div>
      )}

      {accountStatus === "REJECTED" && (
        <div className="flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm">
          <XCircle size={18} className="shrink-0 text-error-500" />
          <div className="flex-1">
            <p className="font-medium text-error-700">Account not approved</p>
            <p className="text-error-600">
              Your registration was not approved. Please contact support or update your information.
            </p>
          </div>
          <Link
            href="/dashboard/onboarding"
            className="shrink-0 rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
          >
            Update & resubmit
          </Link>
        </div>
      )}
    </div>
  );
}
