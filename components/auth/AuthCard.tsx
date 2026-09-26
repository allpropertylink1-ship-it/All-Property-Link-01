"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, BadgeCheck, Handshake, ShieldCheck } from "@/components/ui/icons"
import { useAuth } from "@/lib/auth-context"
import { isSafeReturnUrl, resolvePostAuthTarget } from "@/lib/persona"
import { LoginForm } from "./LoginForm"
import { AgentLoginForm } from "./AgentLoginForm"
import { AgentForgotPasswordForm } from "./AgentForgotPasswordForm"
import { RegisterForm } from "./RegisterForm"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "user", label: "Client & Owner" },
  { id: "agent", label: "Field Rep" },
] as const

const sidePoints = [
  {
    icon: Handshake,
    title: "Direct deals",
    body: "Verified owners & agents across Kenya.",
  },
  {
    icon: ShieldCheck,
    title: "ID-vetted fundis",
    body: "Trade pros checked before they reach you.",
  },
]

const SWEEP_MS = 650

interface Props {
  referralCode?: string
}

function LoginContent({
  activeTab,
  showAgentForgot,
  onTabChange,
  onShowAgentForgot,
  onSwitchToRegister,
  returnUrl,
}: {
  activeTab: "user" | "agent"
  showAgentForgot: boolean
  onTabChange: (tab: "user" | "agent") => void
  onShowAgentForgot: () => void
  onSwitchToRegister: () => void
  returnUrl?: string
}) {
  return (
    <>
      {!showAgentForgot && (
        <div>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-surface-secondary p-1" role="tablist" aria-label="Sign in as">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "touch-target rounded-md px-3 py-2 text-center text-[13px] transition-all duration-150",
                  activeTab === tab.id
                    ? "bg-surface font-bold text-primary shadow-sm"
                    : "font-medium text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "agent" && !showAgentForgot && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-surface-secondary p-2.5">
          <BadgeCheck size={16} className="mt-0.5 shrink-0 text-accent-600" />
          <p className="text-xs leading-snug text-text-secondary">
            <span className="font-bold text-primary">Rep console.</span> Sign in with your regional credentials or Field Rep ID.
          </p>
        </div>
      )}

      {activeTab === "user" ? (
        <LoginForm onSwitchToRegister={onSwitchToRegister} returnUrl={returnUrl} />
      ) : showAgentForgot ? (
        <AgentForgotPasswordForm />
      ) : (
        <AgentLoginForm onForgotPassword={onShowAgentForgot} />
      )}
    </>
  )
}

function WelcomeContent({
  view,
  compact,
  onToggle,
}: {
  view: "login" | "register"
  compact?: boolean
  onToggle: () => void
}) {
  if (compact) {
    return (
      <div className="flex w-full items-center justify-between gap-3 px-1">
        <p className="text-left text-sm font-semibold leading-snug text-white">
          {view === "login" ? "Welcome back." : "Create your APL account."}
          <span className="block text-[11px] font-normal text-white/65">
            {view === "login" ? "Sign in to continue." : "Verify identity to continue."}
          </span>
        </p>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
        >
          {view === "login" ? "Register" : "Sign in"}
        </button>
      </div>
    )
  }
  return (
    <div className="flex w-full flex-col items-center px-5 text-center lg:items-start lg:px-8 lg:text-left">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-200 ring-1 ring-white/15">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" aria-hidden="true" />
        {view === "login" ? "Welcome back" : "Join APL"}
      </span>
      <h1 className="mt-2.5 font-heading text-xl font-bold leading-snug tracking-tight text-white">
        {view === "login" ? (
          <>Kenya&apos;s direct property & artisan network.</>
        ) : (
          <>Create your APL account.</>
        )}
      </h1>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-white/75">
        {view === "login"
          ? "Sign in to your dashboard."
          : "Verify your identity to continue."}
      </p>

      {!compact && (
        <div className="mt-4 w-full space-y-2">
          {sidePoints.map((point) => (
            <div key={point.title} className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-200">
                <point.icon size={16} />
              </span>
              <span className="text-left">
                <span className="block text-[13px] font-semibold text-white">{point.title}</span>
                <span className="block text-[11px] leading-snug text-white/65">{point.body}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <>
          <button
            type="button"
            onClick={onToggle}
            className="mt-4 inline-flex touch-target items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            {view === "login" ? "Create account" : "Sign in"}
            <ArrowRight size={14} className="text-accent-200" />
          </button>
        </>
      )}
    </div>
  )
}

export function AuthCard({ referralCode }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading, refreshUser, clearSession } = useAuth()
  const returnParam = searchParams.get("return")
  const returnUrl = isSafeReturnUrl(returnParam) ? (returnParam as string) : undefined
  // Client-side net for in-app navigation to /auth while signed in (server
  // guard in app/auth/page.tsx covers hard loads). Sends each persona home.
  // NOTE: no early return here — hooks below must run unconditionally.
  // Tri-state verdict (incident 2026-09-17 — redirect ping-pong):
  // - CONFIRMED (server returned a user) → redirect to persona home.
  // - DENIED (server said no session; refreshUser already cleared state) →
  //   stay on the form.
  // - UNKNOWN (server unreachable; refreshUser returns undefined) → clear
  //   the stale client state and defer to the server by navigating to the
  //   safe default. The server's verdicts always terminate (dashboard/KYC/
  //   onboarding/consent, or back here with clean state), so no cycle is
  //   possible. Redirecting on "unknown" was the ping-pong mechanism.
  // A 6s cap keeps a hung /me from blank-screening the page: on timeout we
  // take the UNKNOWN branch, never an unverified redirect.
  const signedIn = !loading && !!user
  const [sessionChecked, setSessionChecked] = useState<null | "confirmed" | "denied" | "unknown">(null)
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
  }, [signedIn, sessionChecked, refreshUser])
  useEffect(() => {
    if (!signedIn || !sessionChecked) return
    if (sessionChecked === "confirmed" && user) {
      router.replace(resolvePostAuthTarget(user, returnUrl))
    } else if (sessionChecked === "unknown") {
      // Server unreachable: drop the stale client state (it may disagree
      // with the server) and let the server decide the destination.
      clearSession()
      router.replace(returnUrl ?? "/dashboard")
    }
    // "denied": refreshUser already cleared the user; render the form.
  }, [signedIn, sessionChecked, user, router, returnUrl, clearSession])

  const [view, setView] = useState<"login" | "register">(
    referralCode ? "register" : "login"
  )
  const [settledView, setSettledView] = useState<"login" | "register">(
    referralCode ? "register" : "login"
  )
  const sweepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loginPaneRef = useRef<HTMLDivElement>(null)
  const registerPaneRef = useRef<HTMLDivElement>(null)
  const loginPageRef = useRef<HTMLDivElement>(null)
  const registerPageRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"user" | "agent">("user")
  const [showAgentForgot, setShowAgentForgot] = useState(false)

  useEffect(() => {
    if (searchParams.get("tab") === "agent") {
      setActiveTab("agent")
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (loginPaneRef.current) loginPaneRef.current.inert = settledView !== "login"
  }, [settledView])

  useEffect(() => {
    if (registerPaneRef.current) registerPaneRef.current.inert = settledView !== "register"
  }, [settledView])

  useEffect(() => {
    if (loginPageRef.current) loginPageRef.current.inert = settledView !== "login"
  }, [settledView])

  useEffect(() => {
    if (registerPageRef.current) registerPageRef.current.inert = settledView !== "register"
  }, [settledView])

  function toggleView(next: "login" | "register") {
    if (next === view) return
    setView(next)
    if (sweepTimerRef.current) clearTimeout(sweepTimerRef.current)
    if (window.matchMedia("(min-width: 1024px)").matches) {
      sweepTimerRef.current = setTimeout(() => setSettledView(next), SWEEP_MS)
    } else {
      setSettledView(next)
    }
  }

  function handleTabChange(tab: "user" | "agent") {
    setActiveTab(tab)
    setShowAgentForgot(false)
  }

  // Render nothing while the signed-in redirect above fires (avoids flashing
  // login/signup to authed users who navigate here in-app).
  if (signedIn) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      {/* Mobile welcome strip — slim, single line */}
      <div className="auth-strip relative px-5 py-5 lg:hidden">
        {view === "login" ? (
          <WelcomeContent compact view="login" onToggle={() => toggleView("register")} />
        ) : (
          <WelcomeContent compact view="register" onToggle={() => toggleView("login")} />
        )}
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Left pane — login */}
        <div
          ref={loginPaneRef}
          aria-hidden={settledView !== "login"}
          className={cn(
            "p-5 sm:p-6",
            view !== "login" && "hidden lg:block"
          )}
        >
          <h2 className="font-heading text-xl font-bold tracking-tight text-text-primary">
            Sign in
          </h2>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Access your dashboard.
          </p>
          <div className="mt-4">
            <LoginContent
              activeTab={activeTab}
              showAgentForgot={showAgentForgot}
              onTabChange={handleTabChange}
              onShowAgentForgot={() => setShowAgentForgot(true)}
              onSwitchToRegister={() => toggleView("register")}
              returnUrl={returnUrl}
            />
          </div>
        </div>

        {/* Right pane — register (no pane header: the sliding panel
            already labels this view, so a second title is duplication) */}
        <div
          ref={registerPaneRef}
          aria-hidden={settledView !== "register"}
          className={cn(
            "p-5 sm:p-6",
            view !== "register" && "hidden lg:block"
          )}
        >
          <div className="mt-0">
            <RegisterForm
              referralCode={referralCode}
              onSwitchToLogin={() => toggleView("login")}
              returnUrl={returnUrl}
            />
          </div>
        </div>
      </div>

      {/* Sliding welcome panel (desktop) — curtain wipe */}
      <div
        className={cn(
          "auth-panel hidden lg:block",
          view === "login" ? "auth-panel--right" : ""
        )}
      >
        <div className="auth-panel-inner">
          <div
            ref={loginPageRef}
            aria-hidden={settledView !== "login"}
            className={cn("auth-panel-page", settledView !== "login" && "is-covered")}
          >
            <WelcomeContent view="login" onToggle={() => toggleView("register")} />
          </div>
          <div
            ref={registerPageRef}
            aria-hidden={settledView !== "register"}
            className={cn("auth-panel-page", settledView !== "register" && "is-covered")}
          >
            <WelcomeContent view="register" onToggle={() => toggleView("login")} />
          </div>
        </div>
      </div>
    </div>
  )
}
