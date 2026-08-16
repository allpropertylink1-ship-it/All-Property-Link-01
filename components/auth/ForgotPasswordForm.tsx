"use client"
import { useState } from "react"
import { api } from "@/lib/api-client"
import { FormBanner } from "@/components/shared/FormFeedback"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: reqError } = await api.post("/api/auth/forgot-password", { email })
    if (reqError) {
      setError(reqError)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-success-500/10 px-4 py-8 text-center">
        <p className="text-sm text-text-primary">
          If an account exists with that email, we&apos;ve sent a reset link.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          style={{ fontSize: "16px" }}
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
      <p className="text-center text-sm text-text-secondary">
        <a href="/auth/login" className="font-medium text-accent-300 hover:text-accent-400">
          Back to sign in
        </a>
      </p>
    </form>
  )
}
