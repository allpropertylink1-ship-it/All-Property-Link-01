import { RequireAuthMethod } from "@/lib/auth-guard"

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuthMethod allowedMethods={["agent"]}>
      {children}
    </RequireAuthMethod>
  )
}