"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PasswordToggle } from "@/components/auth/PasswordToggle"
import { api } from "@/lib/api-client"

function ActivateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid activation link. Contact your administrator.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const { error: err } = await api.post("/api/auth/agent-activate", { token, password })
    if (err) {
      setError(err)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => router.push("/auth/login?tab=agent"), 3000)
      return () => clearTimeout(t)
    }
  }, [success, router])

  if (success) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-success-500/10 px-4 py-3 text-sm text-success-700">
          Your account has been activated. Redirecting to login...
        </div>
        <button
          type="button"
          onClick={() => router.push("/auth/login?tab=agent")}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-text-secondary">
        Set your password to activate your APL Representative account.
      </p>

      {!token && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          Invalid activation link. Please contact your administrator.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-text-primary">
          Password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="new-password"
            name="newPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary">
          Confirm Password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="confirm-password"
            name="confirmPassword"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Re-enter your password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Activating..." : "Activate account"}
      </button>
    </form>
  )
}

export default function AgentActivatePage() {
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
              Activate your account
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Set your password to get started
            </p>
          </div>
          <Suspense fallback={<div className="text-center text-text-secondary">Loading...</div>}>
            <ActivateForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
