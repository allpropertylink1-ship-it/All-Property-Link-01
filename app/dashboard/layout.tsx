import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { KycGate } from "@/components/dashboard/KycGate";
import { RequireAuthMethod } from "@/lib/auth-guard";
import { CURRENT_TERMS_VERSION } from "@/lib/persona";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const user = session.user as {
    accountStatus?: string;
    onboardingComplete?: boolean;
    kycStatus?: string;
    isAgent?: boolean;
    authMethod?: string;
    primaryUserType?: string | null;
    userTypes?: string[];
    acceptedTermsAt?: string | null;
    termsVersion?: string | null;
    ageConfirmed?: boolean;
  };

  if (!user.acceptedTermsAt || user.termsVersion !== CURRENT_TERMS_VERSION) {
    // Keep the deep link so accepting the Terms lands the user where they
    // were headed (e.g. Business Profile) instead of stranding them at the
    // persona home and feeling like a bounce loop. x-pathname is set by
    // middleware on every request.
    const pathname = (await headers()).get("x-pathname");
    redirect(
      pathname && pathname.startsWith("/dashboard")
        ? `/auth/consent?return=${encodeURIComponent(pathname)}`
        : "/auth/consent"
    );
  }

  return (
    <RequireAuthMethod allowedMethods={["user", "agent"]}>
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
        <DashboardNav />
        <div className="min-w-0 flex-1 bg-surface-secondary">
          <DashboardBanner
            accountStatus={user.accountStatus ?? ""}
            onboardingComplete={user.onboardingComplete ?? false}
            kycStatus={user.kycStatus ?? "NONE"}
            authMethod={user.authMethod}
            primaryUserType={user.primaryUserType}
          />
          <KycGate
            kycStatus={user.kycStatus}
            authMethod={user.authMethod}
            primaryUserType={user.primaryUserType}
            userTypes={user.userTypes}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl min-w-0">{children}</div>
            </div>
          </KycGate>
        </div>
      </div>
    </RequireAuthMethod>
  );
}
