"use client"

import { useAuth } from "@/lib/auth-context"
import { notFound } from "next/navigation"
import { ReactNode } from "react"

type AuthMethod = "user" | "agent" | "admin"

interface RequireAuthMethodProps {
  children: ReactNode
  allowedMethods: AuthMethod[]
}

export function RequireAuthMethod({ children, allowedMethods }: RequireAuthMethodProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary-500" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.authMethod || !allowedMethods.includes(user.authMethod)) {
    notFound()
  }

  return <>{children}</>
}