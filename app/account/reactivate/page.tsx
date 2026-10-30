"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api-client"
import { FormBanner } from "@/components/shared/FormFeedback"
import { ArrowRight, Clock, RefreshCw } from "@/components/ui/icons"

export default function ReactivatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reactivating, setReactivating] = useState(false)
  const [feedback, setFeedback] = useState<{ variant: "error" | "success"; message: string } | null>(null)

  const handleReactivate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setReactivating(true)
    setFeedback(null)
    try {
      const { error } = await api.post<{ success: boolean }>("/api/user/reactivate")
      if (error) throw new Error(error)
      setFeedback({ variant: "success", message: "Account reactivated successfully. You've been signed in — welcome back." })
    } catch (err) {
      setFeedback({ variant: "error", message: err instanceof Error ? err.message : "Could not reactivate account" })
    } finally {
      setReactivating(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && user && user.accountStatus !== "DELETED") {
      router.replace("/auth/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary-500" />
          <p className="text-sm text-text-secondary">Loading account…</p>
        </div>
      </div>
    )
  }

  if (!user || user.authMethod !== "user") {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary mb-3">
            <Clock size={16} />
            <span>Sign in required</span>
          </div>
          <p className="text-sm text-text-secondary">
            Sign in to reactivate a soft-deleted account. Reactivation is only available within 30 days of deletion.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.replace("/auth/login")}
            className="touch-target rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            <ArrowRight size={16} className="mr-2" /> Sign in
          </button>
        </div>
      </div>
    )
  }

  if (user.accountStatus !== "DELETED") {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2.5 text-sm text-text-secondary mb-3">
            <Clock size={16} />
            <span>Nothing to reactivate</span>
          </div>
          <h1 className="mt-0.5 font-heading text-xl font-bold tracking-tight text-text-primary">Your account is active</h1>
          <p className="mt-3 text-sm text-text-secondary">
            This page is only for accounts that were soft-deleted. Your account is currently active.
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.replace("/dashboard")}
            className="touch-target rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            <ArrowRight size={16} className="mr-2" /> Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2.5 text-sm text-text-secondary mb-3">
          <RefreshCw size={16} />
          <span>Reactivate account</span>
        </div>
        <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight text-text-primary">Reactivate your account</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Your account was soft-deleted and can be restored within 30 days. Reactivating restores your account, listings,
          and services. Your email and phone will need to be re-verified on your next sign-in.
        </p>
        {feedback && <FormBanner variant={feedback.variant}>{feedback.message}</FormBanner>}
        <form onSubmit={handleReactivate} className="mt-6">
          <button
            type="submit"
            disabled={reactivating}
            className="touch-target w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reactivating ? "Reactivating…" : "Reactivate account"}
          </button>
        </form>
      </div>
    </div>
  )
}
