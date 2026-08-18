"use client"

import { ReactNode } from "react"
import { Building2 } from "@/components/ui/icons"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"

export function AgentGuard({
  children,
  message = "Only APL Representatives can view this page.",
}: {
  children: ReactNode
  message?: string
}) {
  const { user, loading } = useAuth()
  useAgentPasswordGuard()

  if (loading) return null
  if (!user || user.authMethod !== "agent") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
