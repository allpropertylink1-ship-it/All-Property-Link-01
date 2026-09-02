import { requireAuth } from "@/lib/auth-utils";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { KycGate } from "@/components/dashboard/KycGate";
import { RequireAuthMethod } from "@/lib/auth-guard";

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
  };

  return (
    <RequireAuthMethod allowedMethods={["user"]}>
      <div className="flex min-h-[calc(100dvh-4rem)]">
        <DashboardNav />
        <div className="flex-1 bg-surface-secondary">
          <DashboardBanner
            accountStatus={user.accountStatus ?? ""}
            onboardingComplete={user.onboardingComplete ?? false}
            kycStatus={user.kycStatus ?? "NONE"}
            isAgent={user.isAgent}
          />
          <KycGate kycStatus={user.kycStatus} isAgent={user.isAgent}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl min-w-0">{children}</div>
            </div>
          </KycGate>
        </div>
      </div>
    </RequireAuthMethod>
  );
}
