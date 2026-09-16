"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PasswordToggle } from "@/components/auth/PasswordToggle"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import { CenteredAuthShell } from "@/components/auth/stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Lock } from "@/components/ui/icons"

export default function AgentForceChangePasswordPage() {
  const router = useRouter()
  const { user, firstPasswordChange, logout, refreshUser } = useAuth()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user || user.authMethod !== "agent") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-text-secondary">You must log in as an APL Representative to access this page.</p>
          <a href="/auth/login" className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700">Go to login</a>
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
    <CenteredAuthShell
      icon={Lock}
      eyebrow="Mandatory Password Rotation"
      title="Change your password"
      subtitle="You are required to set a new password before continuing."
      assurance="Official Representative Console and 256-Bit SSL Encrypted Session"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <FormBanner variant="error">
            {error}
          </FormBanner>
        )}

        <div>
          <label htmlFor="new-password" className="block text-sm font-semibold text-text-primary">
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
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-text-primary">
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
          aria-busy={loading}
          className="touch-target w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Set new password"}
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full text-center text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Log out
        </button>
      </form>
    </CenteredAuthShell>
  )
}
