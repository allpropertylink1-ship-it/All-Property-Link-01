"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { AgentLoginForm } from "@/components/auth/AgentLoginForm"
import { AgentForgotPasswordForm } from "@/components/auth/AgentForgotPasswordForm"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "user", label: "User Login" },
  { id: "agent", label: "APL Representative" },
] as const

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"user" | "agent">("user")
  const [showAgentForgot, setShowAgentForgot] = useState(false)

  function handleTabChange(tab: "user" | "agent") {
    setActiveTab(tab)
    setShowAgentForgot(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            All Property <span className="text-accent-300">Link</span>
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {showAgentForgot ? "Reset your APL Representative password" : "Sign in to your account"}
            </p>
          </div>

          {!showAgentForgot && (
            <div className="mb-6 flex rounded-lg bg-surface-secondary p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150",
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
            <LoginForm />
          ) : showAgentForgot ? (
            <AgentForgotPasswordForm onBack={() => setShowAgentForgot(false)} />
          ) : (
            <AgentLoginForm onForgotPassword={() => setShowAgentForgot(true)} />
          )}
        </div>
      </div>
    </div>
  )
}