"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthGate({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && !user) {
      const qs = searchParams?.toString()
      const here = `${pathname}${qs ? `?${qs}` : ""}`
      router.replace(`/auth?return=${encodeURIComponent(here)}`)
    }
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.replace("/")
    }
  }, [loading, user, router, requiredRole, pathname, searchParams])

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null
  if (requiredRole && user.role !== requiredRole) return null

  return <>{children}</>
}
