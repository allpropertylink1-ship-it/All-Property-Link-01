"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { BadgeCheck } from "@/components/ui/icons"

interface Props {
  onForgotPassword?: () => void
}

export function AgentLoginForm({ onForgotPassword }: Props) {
  const router = useRouter()
  const { agentLogin } = useAuth()
  const [error, setError] = useState("")
  // Precise sign-in errors: which input the message belongs to. The banner
  // always shows the message; the matching input also gets an inline error.
  const [errorField, setErrorField] = useState<"agentCode" | "password" | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setErrorField(null)

    const form = new FormData(e.currentTarget)
    const agentCode = ((form.get("agentCode") as string) || "").trim()
    const password = form.get("password") as string

    // Client-side precise checks so typos are flagged without a round-trip.
    if (!agentCode) {
      setError("Enter your Agent ID or email address")
      setErrorField("agentCode")
      setLoading(false)
      return
    }
    if (!password) {
      setError("Enter your password")
      setErrorField("password")
      setLoading(false)
      return
    }
    if (agentCode.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentCode)) {
      setError("That email address looks invalid. Check for typos and try again.")
      setErrorField("agentCode")
      setLoading(false)
      return
    }

    const result = await agentLogin(agentCode, password, rememberMe)

    if (result?.error) {
      setError(result.error)
      const field = result?.field ?? result?.code
      setErrorField(
        field === "password" || field === "PASSWORD_REQUIRED" || field === "INCORRECT_PASSWORD"
          ? "password"
          : "agentCode"
      )
      setLoading(false)
      return
    }

    if (result?.requiresPasswordChange) {
      router.push("/auth/agent-force-change-password")
      return
    }

    router.push("/dashboard/agent")
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}
        <div>
          <label htmlFor="agentCode" className="block text-[13px] font-semibold text-text-primary">
            Email or Agent ID
          </label>
          <div className="relative">
            <InputLeadingIcon icon={BadgeCheck} />
            <input
              id="agentCode"
              name="agentCode"
              type="text"
              required
              autoComplete="username"
              aria-invalid={errorField === "agentCode"}
              aria-describedby={errorField === "agentCode" ? "agent-code-error" : undefined}
              onChange={() => { if (errorField === "agentCode") { setErrorField(null); setError("") } }}
              className={stitchInputWithIconClass}
              style={{ fontSize: "16px" }}
              placeholder="REP-NAI-4028 or you@example.co.ke"
            />
          </div>
          {errorField === "agentCode" && error && (
            <p id="agent-code-error" className="mt-1 text-xs text-error-500" role="alert">{error}</p>
          )}
        </div>
        <div>
          <label htmlFor="agent-password" className="block text-[13px] font-semibold text-text-primary">
            Password
          </label>
          <div className="mt-1">
            <PasswordToggle
              id="agent-password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
              ariaInvalid={errorField === "password"}
              ariaDescribedBy={errorField === "password" ? "agent-password-error" : undefined}
              onChange={() => { if (errorField === "password") { setErrorField(null); setError("") } }}
            />
            {errorField === "password" && error && (
              <p id="agent-password-error" className="mt-1 text-xs text-error-500" role="alert">{error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-1.5" htmlFor="agent-remember-me">
            <input
              id="agent-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary"
            />
            <span className="text-[13px] text-text-secondary">Remember me</span>
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[13px] font-semibold text-accent-600 transition-colors hover:text-accent-700"
            >
              Forgot password?
            </button>
          )}
        </div>

        <AuthSubmitButton loading={loading} label="Sign in" loadingLabel="Signing in..." />
      </form>
    </div>
  )
}
