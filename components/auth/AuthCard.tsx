"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Link as LinkIcon,
  ArrowRight,
  ShieldCheck,
  Phone,
  LayoutDashboard,
  Home,
  Briefcase,
  UserCheck,
} from "@/components/ui/icons"
import { LoginForm } from "./LoginForm"
import { AgentLoginForm } from "./AgentLoginForm"
import { AgentForgotPasswordForm } from "./AgentForgotPasswordForm"
import { RegisterForm } from "./RegisterForm"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "user", label: "User Login" },
  { id: "agent", label: "APL Representative" },
] as const

interface Props {
  referralCode?: string
}

const loginPoints = [
  { icon: ShieldCheck, text: "Verified listings and trusted representatives" },
  { icon: Phone, text: "Sign in with email, phone, or Google" },
  { icon: LayoutDashboard, text: "Manage listings, services, and claims in one place" },
]

const registerPoints = [
  { icon: Home, text: "List properties for sale or rent in minutes" },
  { icon: Briefcase, text: "Offer trade services as a fundi or provider" },
  { icon: UserCheck, text: "Get matched with an APL representative" },
]

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
  const points = view === "login" ? loginPoints : registerPoints

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
        {view === "login" ? "Welcome back." : "Welcome."}
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
        <>
          <ul className="mt-6 w-full max-w-sm space-y-3.5">
            {points.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <p.icon size={13} className="text-accent-200" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onToggle}
            className="mt-8 inline-flex touch-target items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
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
  const [view, setView] = useState<"login" | "register">(referralCode ? "register" : "login")
  const [activeTab, setActiveTab] = useState<"user" | "agent">("user")
  const [showAgentForgot, setShowAgentForgot] = useState(false)

  useEffect(() => {
    if (searchParams.get("tab") === "agent") {
      setActiveTab("agent")
    }
  }, [searchParams])

  function handleTabChange(tab: "user" | "agent") {
    setActiveTab(tab)
    setShowAgentForgot(false)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      {/* Mobile welcome strip */}
      <div className="auth-strip relative px-6 py-10 lg:hidden">
        {view === "login" ? (
          <WelcomeContent compact view="login" onToggle={() => setView("register")} />
        ) : (
          <WelcomeContent compact view="register" onToggle={() => setView("login")} />
        )}
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Left panel — login */}
        <div
          aria-hidden={view !== "login"}
          className={cn(
            "p-6 sm:p-8 lg:p-10",
            view !== "login" && "hidden lg:block lg:invisible lg:pointer-events-none"
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
              onSwitchToRegister={() => setView("register")}
            />
          </div>
        </div>

        {/* Right panel — register */}
        <div
          aria-hidden={view !== "register"}
          className={cn(
            "p-6 sm:p-8 lg:p-10",
            view !== "register" && "hidden lg:block lg:invisible lg:pointer-events-none"
          )}
        >
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Join the All Property Link community.
          </p>
          <div className="mt-6">
            <RegisterForm referralCode={referralCode} onSwitchToLogin={() => setView("login")} />
          </div>
        </div>
      </div>

      {/* Sliding blade (desktop) */}
      <div
        aria-hidden
        className={cn(
          "auth-band hidden lg:block",
          view === "register" ? "auth-band--left" : "auth-band--right"
        )}
      >
        <div className="auth-band-inner">
          <div
            aria-hidden={view !== "login"}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
              view === "login" ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <WelcomeContent view="login" onToggle={() => setView("register")} />
          </div>
          <div
            aria-hidden={view !== "register"}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
              view === "register" ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <WelcomeContent view="register" onToggle={() => setView("login")} />
          </div>
        </div>
      </div>
    </div>
  )
}