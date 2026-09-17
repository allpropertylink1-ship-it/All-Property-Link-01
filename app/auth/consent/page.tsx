"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, CURRENT_TERMS_VERSION } from "@/lib/auth-context"
import { personaHomeTarget } from "@/lib/persona"
import { FormBanner } from "@/components/shared/FormFeedback"

export default function ConsentPage() {
  const router = useRouter()
  const { user, loading, acceptConsent, refreshUser } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const needsConsent = !loading && (!user || !user.acceptedTermsAt || user.termsVersion !== CURRENT_TERMS_VERSION)

  useEffect(() => {
    if (!loading && user && !needsConsent) {
      router.replace(personaHomeTarget(user))
    }
  }, [loading, user, needsConsent, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) {
      setError("Please agree to the Terms of Service and Privacy Policy and confirm you are 18+ years old.")
      return
    }
    setSubmitting(true)
    setError("")
    const result = await acceptConsent()
    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    const u = await refreshUser().catch(() => null)
    router.replace(personaHomeTarget(u ?? user))
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
      </div>
    )
  }

  // If not logged in, send to auth
  if (!user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-surface p-6 text-center shadow-sm">
          <h1 className="font-heading text-xl font-bold text-text-primary">Please sign in</h1>
          <p className="mt-2 text-sm text-text-secondary">You need to be signed in to accept the Terms.</p>
          <Link href="/auth" className="mt-4 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">Go to Sign In</Link>
        </div>
      </div>
    )
  }

  if (!needsConsent) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Redirecting" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="All Property Link home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white">APL</span>
            <span className="font-heading text-xl font-bold text-text-primary">All Property <span className="text-accent-600">Link</span></span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary">Before you continue</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            To comply with the Kenya Data Protection Act 2019 and our Terms, please confirm you have read and agree to our policies and that you are 18+ years old.
          </p>

          {error && (
            <div className="mt-4">
              <FormBanner variant="error">{error}</FormBanner>
            </div>
          )}

          <label htmlFor="consent-accept" className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-secondary/50 p-4">
            <input
              id="consent-accept"
              type="checkbox"
              required
              aria-required="true"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm leading-5 text-text-secondary">
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">Privacy Policy</a>.
              {" "}I confirm I am 18+ years old.
            </span>
          </label>

          <p className="mt-3 text-xs text-text-secondary">Version {CURRENT_TERMS_VERSION} · Your consent is stored securely with timestamp and used only for compliance.</p>

          <button
            type="submit"
            disabled={submitting || !accepted}
            aria-busy={submitting}
            className="mt-6 touch-target flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 font-semibold text-white transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : "I Agree and Continue"}
          </button>
        </form>

        <p className="mx-auto mt-4 max-w-lg text-center text-xs leading-5 text-text-secondary">
          Kenya Data Protection Act 2019 Compliant · 256-Bit SSL Encrypted
        </p>
      </div>
    </div>
  )
}
