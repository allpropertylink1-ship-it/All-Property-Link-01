import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { KycGate } from "@/components/dashboard/KycGate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountStatus: true, onboardingComplete: true, kycStatus: true, isAgent: true },
  });

  if (user && user.kycStatus === "VERIFIED" && !user.onboardingComplete && !user.isAgent) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardNav />
      <main className="flex-1 bg-surface-secondary">
        {user && <DashboardBanner accountStatus={user.accountStatus} onboardingComplete={user.onboardingComplete} kycStatus={user.kycStatus} isAgent={user.isAgent} />}
        <KycGate kycStatus={user?.kycStatus} isAgent={user?.isAgent}>
          <div className="p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </KycGate>
      </main>
    </div>
  );
}
