"use client"

import { useState } from "react"
import { BadgeCheck } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { LoginForm } from "./LoginForm"
import { AgentLoginForm } from "./AgentLoginForm"
import { AgentForgotPasswordForm } from "./AgentForgotPasswordForm"

const tabs = [
  { id: "user", label: "Client & Owner" },
  { id: "agent", label: "Field Rep" },
] as const

interface LoginPaneProps {
  returnUrl?: string
}

export function LoginPane({ returnUrl }: LoginPaneProps) {
  const [activeTab, setActiveTab] = useState<"user" | "agent">("user")
  const [showAgentForgot, setShowAgentForgot] = useState(false)

  const handleTabChange = (tab: "user" | "agent") => {
    setActiveTab(tab)
    setShowAgentForgot(false)
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-surface-secondary p-1" role="tablist" aria-label="Sign in as">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
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

      {activeTab === "agent" && !showAgentForgot && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-surface-secondary p-2.5">
          <BadgeCheck size={16} className="mt-0.5 shrink-0 text-accent-600" />
          <p className="text-xs leading-snug text-text-secondary">
            <span className="font-bold text-primary">Rep console.</span> Sign in with your regional credentials or Field Rep ID.
          </p>
        </div>
      )}

      {activeTab === "user" ? (
        <LoginForm returnUrl={returnUrl} />
      ) : showAgentForgot ? (
        <AgentForgotPasswordForm />
      ) : (
        <AgentLoginForm onForgotPassword={() => setShowAgentForgot(true)} />
      )}
    </div>
  )
}
