"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { isSafeReturnUrl, resolvePostAuthTarget } from "@/lib/persona"
import { AuthBrandRail } from "./AuthBrandRail"

interface AuthShellProps {
  children: React.ReactNode
  railView: "login" | "register"
}

export function AuthShell({ children, railView }: AuthShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const returnParam = searchParams.get("return")
  const returnUrl = isSafeReturnUrl(returnParam) ? (returnParam as string) : undefined
  const isDev = process.env.VERCEL_ENV !== "production"

  // Client-side net for in-app navigation to /auth while signed in (server
  // guard in app/auth/login/page.tsx and app/auth/register/page.tsx covers
  // hard loads). Sends each persona home.
  const signedIn = !loading && !!user
  const [sessionChecked, setSessionChecked] = useState<null | "confirmed" | "denied" | "unknown">(null)
  const [verifyRound, setVerifyRound] = useState(0)

  useEffect(() => {
    if (!signedIn || sessionChecked) return
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled) setSessionChecked("unknown")
    }, 6000)
    refreshUser()
      .catch(() => undefined)
      .then((result) => {
        if (cancelled) return
        clearTimeout(timeout)
        setSessionChecked(result ? "confirmed" : result === null ? "denied" : "unknown")
      })
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [signedIn, sessionChecked, verifyRound, refreshUser])

  useEffect(() => {
    if (!signedIn || !sessionChecked) return
    if (sessionChecked === "confirmed" && user) {
      router.replace(resolvePostAuthTarget(user, returnUrl))
    }
  }, [signedIn, sessionChecked, user, router, returnUrl])

  function retryVerification() {
    setSessionChecked(null)
    setVerifyRound((r) => r + 1)
  }

  // Signed-in users never see the forms: while the session is being confirmed
  // we show progress (never a blank page), and when the server cannot be
  // reached we say so with an explicit retry instead of silently bouncing
  // into /dashboard (which bounced straight back here).
  if (signedIn && sessionChecked !== "denied") {
    if (sessionChecked === "unknown") {
      return (
        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-md sm:p-8">
          <h2 className="font-heading text-xl font-bold tracking-tight text-text-primary">
            Still signing you in…
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
            We couldn&apos;t reach the server to confirm your session. Your sign-in
            may still be valid — check your connection, then try again.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={retryVerification}
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => router.replace(returnUrl ?? "/dashboard")}
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )
    }
    return (
      <div
        className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-6 text-center shadow-md"
        role="status"
        aria-label="Signing you in"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary-500" />
        <p className="text-sm font-medium text-text-secondary">Signing you in…</p>
      </div>
    )
  }

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-6 ${isDev ? "pt-14" : ""}`}>
      {isDev && (
        <div className="fixed left-0 top-0 z-50 w-full bg-primary px-4 py-1.5 text-center text-xs font-medium text-white">
          Test accounts available &mdash; use password <strong>Test@123</strong>
        </div>
      )}
      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-md">
          <div className="grid overflow-hidden rounded-xl border bg-surface shadow-md lg:grid-cols-[minmax(0,42%)_1fr]">
            <AuthBrandRail view={railView} />
            <div className="p-5 sm:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
