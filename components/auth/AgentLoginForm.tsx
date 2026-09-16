"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"
import { AuthAssurance, AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { BadgeCheck } from "@/components/ui/icons"

interface Props {
  onForgotPassword?: () => void
}

export function AgentLoginForm({ onForgotPassword }: Props) {
  const router = useRouter()
  const { agentLogin } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const agentCode = form.get("agentCode") as string
    const password = form.get("password") as string

    const result = await agentLogin(agentCode, password, rememberMe)

    if (result?.error) {
      setError(result.error)
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <FormBanner variant="error">{error}</FormBanner>
        )}
        <div>
          <label htmlFor="agentCode" className="block text-sm font-semibold text-text-primary">
            Representative Email or Agent ID
          </label>
          <div className="relative">
            <InputLeadingIcon icon={BadgeCheck} />
            <input
              id="agentCode"
              name="agentCode"
              type="text"
              required
              autoComplete="off"
              aria-label="Representative Email or Agent ID"
              className={stitchInputWithIconClass}
              style={{ fontSize: "16px" }}
              placeholder="e.g. REP-NAI-4028 or rep.name@example.co.ke"
            />
          </div>
        </div>
        <div>
          <label htmlFor="agent-password" className="block text-sm font-semibold text-text-primary">
            Password
          </label>
          <div className="mt-1">
            <PasswordToggle
              id="agent-password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your secure password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2" htmlFor="agent-remember-me">
            <input
              id="agent-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Remember this device for 30 days</span>
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-semibold text-accent-600 transition-colors hover:text-accent-700"
            >
              Forgot Password?
            </button>
          )}
        </div>

        <AuthSubmitButton loading={loading} label="Access Field Console" loadingLabel="Verifying Credentials..." />
      </form>

      <AuthAssurance>
        Official Representative Console and 256-Bit SSL Encrypted Session
      </AuthAssurance>
    </div>
  )
}
