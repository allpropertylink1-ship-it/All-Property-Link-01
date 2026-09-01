"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Plus, CheckCircle, XCircle, Clock } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { StatusPill } from "@/components/shared/StatusPill"
import { Pagination } from "@/components/shared/Pagination"
import { fmtKES } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AvailableListing {
  id: string
  title: string
  slug: string
  price: number
  currency: string
  city: string
  propertyType: string
}

interface Claim {
  id: string
  amount: number
  currency: string
  adminModifiedAmount: number | null
  status: string
  adminNotes: string | null
  agentNotes: string | null
  reviewedAt: string | null
  paidAt: string | null
  createdAt: string
  property: { id: string; title: string; slug: string; city: string; price: number } | null
}

const statuses = ["", "PENDING", "AWAITING_AGENT_ACCEPTANCE", "PAID", "REJECTED"] as const
const statusLabels: Record<string, string> = {
  "": "All",
  PENDING: "Pending",
  AWAITING_AGENT_ACCEPTANCE: "Awaiting You",
  PAID: "Paid",
  REJECTED: "Rejected",
}

export default function AgentClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [listings, setListings] = useState<AvailableListing[]>([])
  const [selectedListing, setSelectedListing] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState("")
  const [claimError, setClaimError] = useState("")

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    setError("")
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (statusFilter) params.set("status", statusFilter)
    const { data, error } = await api.get<{ claims: Claim[]; total: number; totalPages: number }>(`/api/claims?${params}`)
    if (data) {
      setClaims(data.claims)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } else {
      setError(error || "Failed to load")
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchClaims() }, [fetchClaims])

  async function openForm() {
    setShowForm(true)
    setSelectedListing("")
    setFormAmount("")
    setFormNotes("")
    const { data } = await api.get<{ listings: AvailableListing[] }>("/api/claims/available-listings")
    if (data) setListings(data.listings)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(formAmount)
    if (!amount || amount <= 0) return
    setSubmitting(true)
    setClaimError("")
    setClaimSuccess("")
    const { data, error } = await api.post("/api/claims", {
      propertyId: selectedListing || undefined,
      amount,
      agentNotes: formNotes || null,
    })
    if (data) {
      setShowForm(false)
      setClaimSuccess("Claim submitted! It will appear once an admin reviews it.")
      await fetchClaims()
    } else {
      setClaimError(error || "Failed to submit claim. Please try again.")
    }
    setSubmitting(false)
  }

  async function handleAccept(id: string) {
    setClaimError("")
    const { error } = await api.patch(`/api/claims/${id}/accept-modified`)
    if (error) {
      setClaimError(error || "Failed to accept the modified amount. Please try again.")
      return
    }
    await fetchClaims()
  }

  async function handleReject(id: string) {
    setClaimError("")
    const { error } = await api.patch(`/api/claims/${id}/reject-modified`)
    if (error) {
      setClaimError(error || "Failed to reject the modified amount. Please try again.")
      return
    }
    await fetchClaims()
  }

  return (
    <AgentGuard>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Payment Claims</h1>
          <p className="mt-1 text-sm text-text-secondary">{total} total claim{total !== 1 ? "s" : ""}</p>
        </div>
        <button type="button" onClick={openForm}
          className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
        ><Plus size={18} />New Claim</button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary-600 text-white" : "bg-surface-secondary text-text-secondary hover:bg-border"}`}
          >{statusLabels[s]}</button>
        ))}
      </div>

      {claimSuccess && (
        <div className="mb-4">
          <FormBanner variant="success">{claimSuccess}</FormBanner>
        </div>
      )}
      {claimError && (
        <div className="mb-4">
          <FormBanner variant="error">{claimError}</FormBanner>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <AlertCircle size={24} className="text-error-500" />
          <p className="text-sm text-text-secondary">{error}</p>
          <button type="button" onClick={fetchClaims} className="touch-target rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white">Retry</button>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-secondary">No claims found. Submit your first payment claim above.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {claims.map((c) => (
                <tr key={c.id} className="bg-surface hover:bg-surface-secondary">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {c.property ? `${c.property.title} (${c.property.city})` : "-"}
                  </td>
                  <td className="px-4 py-3 text-text-primary">
                    {c.adminModifiedAmount ? (
                      <span><span className="line-through text-muted">{fmtKES(c.amount)}</span> → {fmtKES(Number(c.adminModifiedAmount))}</span>
                    ) : fmtKES(c.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={c.status}
                      icon={
                        c.status === "PAID" ? <CheckCircle size={12} /> :
                        c.status === "REJECTED" ? <XCircle size={12} /> :
                        c.status === "AWAITING_AGENT_ACCEPTANCE" ? <Clock size={12} /> : undefined
                      }
                    />
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">{c.agentNotes || c.adminNotes || "-"}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {c.status === "AWAITING_AGENT_ACCEPTANCE" && (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => handleAccept(c.id)}
                          className="rounded-md bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 transition-colors hover:bg-success-500/20">Accept</button>
                        <button type="button" onClick={() => handleReject(c.id)}
                          className="rounded-md bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/20">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md bg-surface p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">New Payment Claim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Listing (optional)</label>
              <select value={selectedListing} onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">No specific listing</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title} — {l.city} ({l.price == null ? "Price on request" : fmtKES(Number(l.price))})</option>
                ))}
              </select>
              {listings.length === 0 && (
                <p className="mt-1 text-xs text-muted">No unclaimed listings available from your referrals.</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Amount (KES) *</label>
              <input type="number" min="1" step="0.01" required value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Notes</label>
              <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} placeholder="Reason for claim..."
                className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" />
            </div>
            <button type="submit" disabled={submitting || !formAmount} aria-busy={submitting}
              className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:opacity-50"
            >{submitting ? <Loader2 size={16} className="animate-spin" /> : null}{submitting ? "Submitting..." : "Submit Claim"}</button>
          </form>
        </DialogContent>
      </Dialog>
    </AgentGuard>
  )
}
