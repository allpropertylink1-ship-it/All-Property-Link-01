import { RequireAuthMethod } from "@/lib/auth-guard"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { DashboardBanner } from "@/components/dashboard/DashboardBanner"
import { KycGate } from "@/components/dashboard/KycGate"

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuthMethod allowedMethods={["agent"]}>
      <div className="flex min-h-[calc(100dvh-4rem)]">
        <DashboardNav />
        <div className="flex-1 bg-surface-secondary">
          <DashboardBanner
            accountStatus="ACTIVE"
            onboardingComplete={true}
            kycStatus="VERIFIED"
            isAgent={true}
          />
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </RequireAuthMethod>
  )
}