import Link from "next/link";
import { Clock, XCircle, ShieldAlert } from "lucide-react";

interface DashboardBannerProps {
  accountStatus: string;
  kycStatus: string;
  isAgent?: boolean;
}

export function DashboardBanner({ accountStatus, kycStatus, isAgent }: DashboardBannerProps) {
  if (isAgent) return null;
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
                ? "Complete identity verification to access your dashboard."
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
            <p className="text-warning-600">Your account is awaiting admin review. You will be notified once approved.</p>
          </div>
        </div>
      )}

      {accountStatus === "REJECTED" && (
        <div className="flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm">
          <XCircle size={18} className="shrink-0 text-error-500" />
          <div className="flex-1">
            <p className="font-medium text-error-700">Account not approved</p>
            <p className="text-error-600">
              Your registration was not approved. Please contact support for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
