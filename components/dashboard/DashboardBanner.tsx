import Link from "next/link";
import { Clock, XCircle } from "lucide-react";

interface DashboardBannerProps {
  accountStatus: string;
  onboardingComplete: boolean;
}

export function DashboardBanner({ accountStatus, onboardingComplete }: DashboardBannerProps) {
  if (accountStatus === "ACTIVE") return null;

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
                : "Please complete your profile to submit for admin approval."}
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
