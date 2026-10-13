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
  customerTo = "/",
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

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" role="status" aria-label="Loading your account">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary-500" />
        <p className="mt-3 text-sm text-text-secondary">Loading your account…</p>
      </div>
    )
  }
  if (personaRedirectTarget({ authMethod: user.authMethod, primaryUserType: user.primaryUserType, userTypes: user.userTypes }, { customerTo })) {
    // Redirecting (effect above): show progress, never a blank page.
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" role="status" aria-label="Taking you to your dashboard">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary-500" />
        <p className="mt-3 text-sm text-text-secondary">Taking you to your dashboard…</p>
      </div>
    )
  }
  return <>{children}</>
}
