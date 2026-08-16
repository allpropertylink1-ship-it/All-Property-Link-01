"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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

function WelcomeText({ view }: { view: "login" | "register" }) {
  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-500",
          view === "login" ? "opacity-100" : "opacity-0"
        )}
      >
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
          All Property Link
        </p>
        <h2 className="font-heading text-3xl font-bold leading-tight text-white lg:text-4xl">
          Welcome back.
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
          Your properties and services are exactly where you left them.
        </p>
      </div>
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-500",
          view === "register" ? "opacity-100" : "opacity-0"
        )}
      >
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
          All Property Link
        </p>
        <h2 className="font-heading text-3xl font-bold leading-tight text-white lg:text-4xl">
          Welcome.
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
          Join thousands of property owners, agents, and service providers across Kenya.
        </p>
      </div>
    </div>
  )
}

export function AuthCard({ referralCode }: Props) {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"login" | "register">("login")
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
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 px-6 py-8 text-center lg:hidden">
        <WelcomeText view={view} />
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
          <LoginContent
            activeTab={activeTab}
            showAgentForgot={showAgentForgot}
            onTabChange={handleTabChange}
            onShowAgentForgot={() => setShowAgentForgot(true)}
            onSwitchToRegister={() => setView("register")}
          />
        </div>

        {/* Right panel — register */}
        <div
          aria-hidden={view !== "register"}
          className={cn(
            "p-6 sm:p-8 lg:p-10",
            view !== "register" && "hidden lg:block lg:invisible lg:pointer-events-none"
          )}
        >
          <RegisterForm referralCode={referralCode} onSwitchToLogin={() => setView("login")} />
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
          <WelcomeText view={view} />
        </div>
      </div>
    </div>
  )
}
