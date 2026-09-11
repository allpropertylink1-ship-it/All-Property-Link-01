"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { personaRedirectTarget } from "@/lib/persona"

/**
 * Client-side persona gate for user-only dashboard pages.
 * Reps are sent to /dashboard/agent, customers to `customerTo`.
 * Renders nothing while redirecting (avoids flashing gated content).
 */
export function PersonaGate({
  children,
  customerTo = "/dashboard/notifications",
}: {
  children: ReactNode
  customerTo?: string
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || !user) return
    const target = personaRedirectTarget(
      { authMethod: user.authMethod, primaryUserType: user.primaryUserType, userTypes: user.userTypes },
      { customerTo }
    )
    if (target) router.replace(target)
  }, [user, loading, router, customerTo])

  if (loading || !user) return null
  if (personaRedirectTarget({ authMethod: user.authMethod, primaryUserType: user.primaryUserType, userTypes: user.userTypes }, { customerTo })) {
    return null
  }
  return <>{children}</>
}
