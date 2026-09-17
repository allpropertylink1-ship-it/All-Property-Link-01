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
  { id: "user", label: "Client & Property Owner", description: "Owners, buyers, renters & providers" },
  { id: "agent", label: "APL Field Representative", description: "Accredited reps & inspectors" },
] as const

const sidePoints = [
  {
    icon: Handshake,
    title: "Direct Engagement",
    body: "Negotiate directly with verified Property Owners and Agents across Kenya.",
  },
  {
    icon: ShieldCheck,
    title: "ID-Audited Fundis & Technicians",
    body: "Trade professionals vetted against their identification documents before they reach you.",
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
          <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Access Classification
          </p>
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-secondary p-1.5" role="tablist" aria-label="Sign in as">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "touch-target rounded-lg px-3 py-2.5 text-left transition-all duration-150 sm:px-4",
                  activeTab === tab.id
                    ? "bg-surface font-bold text-primary shadow-sm"
                    : "font-medium text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="block text-sm">{tab.label}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-text-secondary">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "agent" && !showAgentForgot && (
        <div className="mb-4 rounded-xl bg-surface-secondary p-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <BadgeCheck size={18} className="text-accent-600" />
            Official Representative Console
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            Field Officers and Certified Inspectors sign in with their allocated regional credentials or assigned Field Rep ID.
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
  return (
    <div className="flex w-full flex-col items-center px-6 text-center lg:items-start lg:px-10 lg:text-left">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-200 ring-1 ring-white/15">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" aria-hidden="true" />
        {view === "login" ? "APL Portal Log In" : "Registration Portal"}
      </span>
      <h1 className="mt-4 font-heading text-2xl font-bold leading-tight tracking-tight text-white lg:text-[1.75rem]">
        {view === "login" ? (
          <>Welcome back to Kenya&apos;s direct real estate and certified artisan network.</>
        ) : (
          <>Join Kenya&apos;s authoritative real estate and artisan ecosystem.</>
        )}
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
        {view === "login"
          ? "Sign in to continue to your dashboard."
          : "Create your account — you'll verify your identity to continue."}
      </p>

      {!compact && (
        <div className="mt-6 w-full space-y-2.5">
          {sidePoints.map((point) => (
            <div key={point.title} className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-200">
                <point.icon size={20} />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">{point.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/70">{point.body}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <>
          <div className="mt-5 h-px w-16 bg-accent-400" aria-hidden="true" />
          <button
            type="button"
            onClick={onToggle}
            className="mt-4 inline-flex touch-target items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            {view === "login" ? "Create an account" : "Sign in"}
            <ArrowRight size={16} className="text-accent-200" />
          </button>
        </>
      )}
    </div>
  )
}

export function AuthCard({ referralCode }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const returnParam = searchParams.get("return")
  const returnUrl = isSafeReturnUrl(returnParam) ? (returnParam as string) : undefined
  // Client-side net for in-app navigation to /auth while signed in (server
  // guard in app/auth/page.tsx covers hard loads). Sends each persona home.
  // NOTE: no early return here — hooks below must run unconditionally.
  const signedIn = !loading && !!user
  useEffect(() => {
    if (signedIn && user) {
      router.replace(resolvePostAuthTarget(user, returnUrl))
    }
  }, [signedIn, user, router, returnUrl])

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
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      {/* Mobile welcome strip */}
      <div className="auth-strip relative px-6 py-10 lg:hidden">
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
            "p-6 sm:p-8 lg:p-10",
            view !== "login" && "hidden lg:block"
          )}
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary">
            Sign In to Your Account
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Enter your verified credentials to access your direct transaction dashboard.
          </p>
          <div className="mt-5">
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

        {/* Right pane — register */}
        <div
          ref={registerPaneRef}
          aria-hidden={settledView !== "register"}
          className={cn(
            "p-6 sm:p-8 lg:p-10",
            view !== "register" && "hidden lg:block"
          )}
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary">
            Create Your All Property Link Account
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Join the All Property Link community across Kenya.
          </p>
          <div className="mt-5">
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
