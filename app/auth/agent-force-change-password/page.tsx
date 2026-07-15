"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "@/components/auth/PasswordToggle"

export default function AgentForceChangePasswordPage() {
  const router = useRouter()
  const { user, firstPasswordChange, logout, refreshUser } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user || user.authMethod !== "agent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-text-secondary">You must log in as a Referral Partner to access this page.</p>
          <a href="/auth/login" className="mt-4 inline-block text-accent-300 hover:text-accent-400">Go to login</a>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const result = await firstPasswordChange(password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    await refreshUser()
    router.push("/dashboard/agent")
    router.refresh()
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
              Change your password
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              You are required to set a new password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-text-primary">
                New Password
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
              disabled={loading}
              className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Set new password"}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}