"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AgentForgotPasswordForm() {
  const router = useRouter()
  const { agentForgotPassword } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await agentForgotPassword(identifier)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const backToLogin = () => router.push("/auth/login?tab=agent")

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-success-500/10 px-4 py-3 text-sm text-success-700">
          If an account with that information exists, a password reset link has been sent to the registered email address.
          If you don't receive an email within 5 minutes, check your spam folder or contact support.
        </div>
        <button
          type="button"
          onClick={backToLogin}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-text-secondary">
        Enter your Agent Code or registered email address and we'll send you a reset link.
      </p>

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="agent-identifier" className="block text-sm font-medium text-text-primary">
          Agent Code or Email
        </label>
        <input
          id="agent-identifier"
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          placeholder="APL-XXX-000-00/00 or agent@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <button
        type="button"
        onClick={backToLogin}
        className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Back to login
      </button>
    </form>
  )
}