"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/LoginForm"
import { PartnerLoginForm } from "@/components/auth/PartnerLoginForm"
import { PartnerForgotPasswordForm } from "@/components/auth/PartnerForgotPasswordForm"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "user", label: "User Login" },
  { id: "agent", label: "Referral Partner" },
] as const

function LoginContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"user" | "agent">("user")
  const [showAgentForgot, setShowAgentForgot] = useState(false)

  useEffect(() => {
    if (tabParam === "agent") {
      setActiveTab("agent")
    }
  }, [tabParam])

  function handleTabChange(tab: "user" | "agent") {
    setActiveTab(tab)
    setShowAgentForgot(false)
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {showAgentForgot ? "Reset your Referral Partner password" : "Sign in to your account"}
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
        <LoginForm />
      ) : showAgentForgot ? (
        <PartnerForgotPasswordForm />
      ) : (
        <PartnerLoginForm onForgotPassword={() => setShowAgentForgot(true)} />
      )}
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            All Property <span className="text-accent-300">Link</span>
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8">
          <Suspense fallback={<div className="text-center text-text-secondary py-8">Loading...</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}