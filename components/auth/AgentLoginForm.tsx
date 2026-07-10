"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "./PasswordToggle"

interface Props {
  onForgotPassword?: () => void
}

export function AgentLoginForm({ onForgotPassword }: Props) {
  const router = useRouter()
  const { agentLogin } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const agentCode = form.get("agentCode") as string
    const password = form.get("password") as string

    const result = await agentLogin(agentCode, password)

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="agentCode" className="block text-sm font-medium text-text-primary">
          Agent Code
        </label>
        <input
          id="agentCode"
          name="agentCode"
          type="text"
          required
          autoComplete="off"
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          style={{ fontSize: "16px" }}
          placeholder="APL-XXX-000-00/00"
        />
      </div>
      <div>
        <label htmlFor="agent-password" className="block text-sm font-medium text-text-primary">
          Password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="agent-password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-accent-300 hover:text-accent-400 transition-colors"
          >
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}