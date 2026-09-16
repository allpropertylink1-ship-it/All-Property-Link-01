"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthSubmitButton, InputLeadingIcon, stitchInputWithIconClass } from "./stitch-auth"
import { FormBanner } from "@/components/shared/FormFeedback"
import { BadgeCheck } from "@/components/ui/icons"

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
      <div className="space-y-4">
        <FormBanner variant="success">
          If an account with that information exists, a password reset link has been sent to the registered email address.
          If you don&apos;t receive an email within 5 minutes, check your spam folder or contact support.
        </FormBanner>
        <button
          type="button"
          onClick={backToLogin}
          aria-busy={false}
          className="touch-target w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-text-secondary">
        Enter your APL Representative Code or registered email address and we&apos;ll send you a reset link.
      </p>

      {error && (
        <FormBanner variant="error">{error}</FormBanner>
      )}

      <div>
        <label htmlFor="agent-identifier" className="block text-sm font-semibold text-text-primary">
          APL Representative Code or Email
        </label>
        <div className="relative">
          <InputLeadingIcon icon={BadgeCheck} />
          <input
            id="agent-identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-label="APL Representative Code or Email"
            className={stitchInputWithIconClass}
            style={{ fontSize: "16px" }}
            placeholder="APL-XXX-000-00/00 or agent@example.com"
          />
        </div>
      </div>

      <AuthSubmitButton loading={loading} label="Send reset link" loadingLabel="Sending..." />

      <button
        type="button"
        onClick={backToLogin}
        className="w-full text-center text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        Back to login
      </button>
    </form>
  )
}
