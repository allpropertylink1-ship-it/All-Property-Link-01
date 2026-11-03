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

const CLAIM_TYPES: { value: string; label: string; suggested: number; hint: string }[] = [
  { value: "OWNER", label: "Property Owner", suggested: 500, hint: "Paid when their first property listing is approved" },
  { value: "AGENT", label: "Property Agent", suggested: 500, hint: "Paid when their first property listing is approved" },
  { value: "BNB", label: "BnB / Short-let Host", suggested: 400, hint: "Paid when their first listing is approved" },
  { value: "SERVICE_PROVIDER", label: "Service Provider", suggested: 300, hint: "Paid when their first service is created" },
  { value: "FUNDI", label: "Fundi / Tradesperson", suggested: 300, hint: "Paid when their first service is created" },
]

interface Referral {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  userTypes: string[]
}

interface Claim {
  id: string
  referredUser: { id: string; firstName: string; lastName: string; phone: string | null } | null
  claimType: string
  amount: number
  currency: string
  rateSnapshot: number
  adminModifiedAmount: number | null
  status: string
  adminNotes: string | null
  agentNotes: string | null
  reviewedAt: string | null
  paidAt: string | null
  createdAt: string
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
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [selectedReferral, setSelectedReferral] = useState("")
  const [claimType, setClaimType] = useState<(typeof CLAIM_TYPES)[number] | null>(null)
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

  const fetchReferrals = useCallback(async () => {
    const { data } = await api.get<{ referrals: Referral[]; total: number; totalPages: number }>(
      "/api/referral-partner/referrals?limit=100&status=ACTIVE"
    )
    if (data) setReferrals(data.referrals)
  }, [])

  useEffect(() => { fetchReferrals() }, [fetchReferrals])

  const suggestedForType = (t: string) => CLAIM_TYPES.find((c) => c.value === t)?.suggested

  async function openForm() {
    setShowForm(true)
    setSelectedReferral("")
    setClaimType(null)
    setFormAmount("")
    setFormNotes("")
    setClaimError("")
    setClaimSuccess("")
  }

  const typeForReferral = (r: Referral) => {
    // Heuristic: agent-role users default to AGENT, others to OWNER; agent can override.
    const types = r.userTypes
    if (types.includes("AGENT")) return "AGENT"
    if (types.includes("SERVICE_PROVIDER")) return "SERVICE_PROVIDER"
    if (types.includes("FUNDI")) return "FUNDI"
    return "OWNER"
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedReferral || !claimType) return
    const amount = formAmount === "" ? undefined : parseFloat(formAmount)
    if (amount !== undefined && (!amount || amount <= 0)) return
    setSubmitting(true)
    setClaimError("")
    setClaimSuccess("")
    const body: { referredUserId: string; claimType: string; amount?: number; agentNotes?: string | null } = {
      referredUserId: selectedReferral,
      claimType: claimType.value,
      agentNotes: formNotes || null,
    }
    if (amount !== undefined) body.amount = amount
    const { data, error } = await api.post("/api/claims", body)
    if (data) {
      setShowForm(false)
      setClaimSuccess("Commission claim submitted! It will appear once an admin reviews it.")
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
      <section aria-labelledby="claims-heading" className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Commission hub
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="claims-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary">Commission Claims</h1>
            <p className="mt-1 text-sm text-text-secondary">{total} total claim{total !== 1 ? "s" : ""}</p>
          </div>
          <button type="button" onClick={openForm}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
          ><Plus size={18} />New Claim</button>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter claims by status">
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1) }} aria-pressed={statusFilter === s}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary-600 text-white" : "bg-surface text-text-secondary hover:bg-surface-secondary border border-border"}`}
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
        <div className="rounded-xl border border-border bg-surface px-4 py-20 text-center text-sm text-text-secondary" role="status">No claims found. Submit your first commission claim above.</div>
      ) : (
        <>
          <ul className="space-y-3 sm:hidden" aria-label="Commission claims">
            {claims.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{c.referredUser ? `${c.referredUser.firstName} ${c.referredUser.lastName}` : "-"}</p>
                    <p className="text-xs text-text-secondary">{c.claimType.replace(/_/g, " ")} &middot; {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusPill
                    status={c.status}
                    icon={
                      c.status === "PAID" ? <CheckCircle size={12} /> :
                      c.status === "REJECTED" ? <XCircle size={12} /> :
                      c.status === "AWAITING_AGENT_ACCEPTANCE" ? <Clock size={12} /> : undefined
                    }
                  />
                </div>
                <p className="mt-1 text-base font-bold text-text-primary">
                  {c.adminModifiedAmount ? (
                    <span><span className="font-normal text-text-secondary line-through">{fmtKES(c.amount)}</span> {fmtKES(Number(c.adminModifiedAmount))}</span>
                  ) : fmtKES(c.amount)}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">{c.agentNotes || c.adminNotes || "-"}</p>
                {c.status === "AWAITING_AGENT_ACCEPTANCE" && (
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button type="button" onClick={() => handleAccept(c.id)}
                      className="touch-target flex-1 rounded-lg bg-success-50 px-2.5 py-2 text-xs font-medium text-success-700 transition-colors hover:bg-success-500/20">Accept</button>
                    <button type="button" onClick={() => handleReject(c.id)}
                      className="touch-target flex-1 rounded-lg bg-error-50 px-2.5 py-2 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/20">Reject</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Claimed for</th>
                <th className="px-4 py-3 font-medium">Type</th>
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
                  <td className="px-4 py-3 font-medium text-text-primary truncate">{c.referredUser ? `${c.referredUser.firstName} ${c.referredUser.lastName}` : "-"}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.claimType.replace(/_/g, " ")}</td>
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
                          className="touch-target rounded-md bg-success-50 px-2.5 py-2 text-xs font-medium text-success-700 transition-colors hover:bg-success-500/20">Accept</button>
                        <button type="button" onClick={() => handleReject(c.id)}
                          className="touch-target rounded-md bg-error-50 px-2.5 py-2 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/20">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md bg-surface p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">New Commission Claim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="claim-referral" className="mb-1 block text-sm font-medium text-text-primary">Claimed for (your referral) *</label>
              <select id="claim-referral" value={selectedReferral} onChange={(e) => {
                setSelectedReferral(e.target.value)
                if (!claimType) {
                  const r = referrals.find((x) => x.id === e.target.value)
                  if (r) {
                    setClaimType(CLAIM_TYPES.find((c) => c.value === typeForReferral(r)) || null)
                    setFormAmount(String(suggestedForType(typeForReferral(r))))
                  }
                }
              }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">Select a referred user</option>
                {referrals.map((r) => (
                  <option key={r.id} value={r.id}>{r.firstName} {r.lastName}{r.phone ? ` (${r.phone})` : ""}</option>
                ))}
                {referrals.length === 0 && <option value="" disabled>No active referrals yet</option>}
              </select>
            </div>
            <div>
              <label htmlFor="claim-type" className="mb-1 block text-sm font-medium text-text-primary">Claim type *</label>
              <select id="claim-type" value={claimType?.value ?? ""} onChange={(e) => {
                const t = CLAIM_TYPES.find((c) => c.value === e.target.value)
                if (t) { setClaimType(t); setFormAmount(String(t.suggested)) }
              }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">Select claim type</option>
                {CLAIM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {claimType && (
                <p className="mt-1 text-xs text-text-secondary">{claimType.hint} &middot; Suggested: {fmtKES(claimType.suggested)}</p>
              )}
            </div>
            <div>
              <label htmlFor="claim-amount" className="mb-1 block text-sm font-medium text-text-primary">Amount (KES)</label>
              <p className="mt-0.5 text-xs text-text-secondary">Leave blank to use the standard rate for this type.</p>
              <input id="claim-amount" type="number" min="1" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" placeholder={claimType ? fmtKES(claimType.suggested) : "e.g. 500"} />
            </div>
            <div>
              <label htmlFor="claim-notes" className="mb-1 block text-sm font-medium text-text-primary">Notes</label>
              <textarea id="claim-notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} placeholder="Reason for claim..."
                className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" />
            </div>
            <button type="submit" disabled={submitting || !selectedReferral || !claimType} aria-busy={submitting}
              className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:opacity-50"
            >{submitting ? <Loader2 size={16} className="animate-spin" /> : null}{submitting ? "Submitting..." : "Submit Claim"}</button>
          </form>
        </DialogContent>
      </Dialog>
    </AgentGuard>
  )
}
