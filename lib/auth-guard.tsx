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
  const { user } = useAuth()

  if (!user || !user.authMethod || !allowedMethods.includes(user.authMethod)) {
    notFound()
  }

  return <>{children}</>
}