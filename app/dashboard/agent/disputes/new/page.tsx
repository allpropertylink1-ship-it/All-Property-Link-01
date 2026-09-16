"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { AgentGuard } from "@/components/dashboard/AgentGuard"

export default function NewDisputePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required")
      return
    }
    setLoading(true)
    setError("")

    const { error } = await api.post("/api/referral-partner/disputes", {
      title: title.trim(),
      description: description.trim(),
      amount: amount ? parseFloat(amount) : 0,
    })

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    router.push("/dashboard/agent/disputes")
    router.refresh()
  }

  return (
    <AgentGuard>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard/agent/disputes" className="touch-target inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-600 hover:text-primary-700">
          <ArrowLeft size={16} /> Back to disputes
        </Link>

        <section aria-labelledby="new-dispute-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Commission hub
          </p>
          <h1 id="new-dispute-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">New Dispute</h1>
          <p className="mt-1 text-sm text-text-secondary">Describe the issue — an admin will review and respond.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-label="New dispute">
          {error && (
            <FormBanner variant="error">{error}</FormBanner>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              placeholder="Brief title for your dispute"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5}
              className="mt-1 block w-full resize-y rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              placeholder="Describe the issue in detail"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-primary">Disputed Amount (KES)</label>
            <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              placeholder="0"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Link href="/dashboard/agent/disputes" className="touch-target rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} aria-busy={loading}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </AgentGuard>
  )
}
