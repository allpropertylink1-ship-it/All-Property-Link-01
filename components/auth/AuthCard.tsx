"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Link as LinkIcon, ArrowRight } from "@/components/ui/icons"
import { LoginForm } from "./LoginForm"
import { AgentLoginForm } from "./AgentLoginForm"
import { AgentForgotPasswordForm } from "./AgentForgotPasswordForm"
import { RegisterForm } from "./RegisterForm"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "user", label: "User Login" },
  { id: "agent", label: "APL Representative" },
] as const

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
}: {
  activeTab: "user" | "agent"
  showAgentForgot: boolean
  onTabChange: (tab: "user" | "agent") => void
  onShowAgentForgot: () => void
  onSwitchToRegister: () => void
}) {
  return (
    <>
      {!showAgentForgot && (
        <div className="mb-6 flex rounded-lg bg-surface-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 rounded-md px-4 py-3 text-sm font-medium transition-all duration-150",
                activeTab === tab.id
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "user" ? (
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
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
    <div className="flex w-full flex-col items-center px-6 text-center">
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15",
          compact ? "h-10 w-10" : "h-12 w-12"
        )}
      >
        <LinkIcon size={compact ? 18 : 22} className="text-accent-200" />
      </span>
      <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-200">
        All Property Link
      </p>
      <h1
        className={cn(
          "mt-2 font-heading font-bold leading-tight text-white",
          compact ? "text-2xl" : "text-3xl lg:text-4xl"
        )}
      >
        {view === "login" ? (
          <>
            Welcome <em className="italic text-accent-200">back.</em>
          </>
        ) : (
          "Welcome."
        )}
      </h1>
      <p
        className={cn(
          "mt-3 leading-relaxed text-white/80",
          compact ? "max-w-xs text-sm" : "max-w-sm text-[0.9375rem]"
        )}
      >
        {view === "login"
          ? "Your properties and services are exactly where you left them."
          : "Join thousands of property owners, agents, and service providers across Kenya."}
      </p>
      <div className="mt-6 h-px w-16 bg-gradient-to-r from-accent-300 to-transparent" />
      {!compact && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-8 inline-flex touch-target items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          {view === "login" ? "Create an account" : "Sign in"}
          <ArrowRight size={16} className="text-accent-200" />
        </button>
      )}
    </div>
  )
}

export function AuthCard({ referralCode }: Props) {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"login" | "register">(referralCode ? "register" : "login")
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
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
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Sign in to your account
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Welcome back &mdash; pick up where you left off.
          </p>
          <div className="mt-6">
            <LoginContent
              activeTab={activeTab}
              showAgentForgot={showAgentForgot}
              onTabChange={handleTabChange}
              onShowAgentForgot={() => setShowAgentForgot(true)}
              onSwitchToRegister={() => toggleView("register")}
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
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Join the All Property Link community.
          </p>
          <div className="mt-6">
            <RegisterForm referralCode={referralCode} onSwitchToLogin={() => toggleView("login")} />
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