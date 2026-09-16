"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PasswordToggle } from "@/components/auth/PasswordToggle"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import { CenteredAuthShell } from "@/components/auth/stitch-auth"
import { api } from "@/lib/api-client"
import { FormBanner } from "@/components/shared/FormFeedback"
import { BadgeCheck } from "@/components/ui/icons"

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
      <div className="space-y-4">
        <FormBanner variant="success">
          Your account has been activated. Redirecting to login...
        </FormBanner>
        <button
          type="button"
          onClick={() => router.push("/auth/login?tab=agent")}
          className="touch-target w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Go to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!token && (
        <FormBanner variant="error">
          Invalid activation link. Please contact your administrator.
        </FormBanner>
      )}

      {error && (
        <FormBanner variant="error">
          {error}
        </FormBanner>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-semibold text-text-primary">
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
        disabled={loading || !token}
        aria-busy={loading}
        className="touch-target w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Activating..." : "Activate account"}
      </button>
    </form>
  )
}

export default function AgentActivatePage() {
  return (
    <CenteredAuthShell
      icon={BadgeCheck}
      eyebrow="Representative Onboarding"
      title="Activate your account"
      subtitle="Set your password to activate your APL Representative account."
      assurance="Official Representative Console and 256-Bit SSL Encrypted Session"
      backHref="/auth/login?tab=agent"
      backLabel="Back to login"
    >
      <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading...</div>}>
        <ActivateForm />
      </Suspense>
    </CenteredAuthShell>
  )
}
