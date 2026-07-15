"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { Loader2, AlertCircle, Building2, Plus, X, CheckCircle, XCircle } from "lucide-react"

interface Claim {
  id: string
  amount: number
  currency: string
  periodLabel: string | null
  notes: string | null
  status: string
  adminNotes: string | null
  reviewedAt: string | null
  createdAt: string
}

const fmt = (n: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n)

const statuses = ["", "PENDING", "APPROVED", "REJECTED"] as const
const statusLabels: Record<string, string> = { "": "All", PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" }

export default function AgentClaimsPage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
  const [claims, setClaims] = useState<Claim[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formAmount, setFormAmount] = useState("")
  const [formPeriod, setFormPeriod] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchClaims = useCallback(async () => {
    setLoading(true)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(formAmount)
    if (!amount || amount <= 0) return
    setSubmitting(true)
    const { data } = await api.post("/api/claims", {
      amount,
      periodLabel: formPeriod || null,
      notes: formNotes || null,
    })
    if (data) {
      setShowForm(false)
      setFormAmount("")
      setFormPeriod("")
      setFormNotes("")
      await fetchClaims()
    }
    setSubmitting(false)
  }

  if (user?.authMethod !== "agent") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary">Only Referral Partners can view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Payment Claims</h1>
          <p className="mt-1 text-sm text-text-secondary">{total} total claim{total !== 1 ? "s" : ""}</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)}
          className="touch-target rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-all inline-flex items-center gap-2"
        ><Plus size={18} />New Claim</button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition-colors ${statusFilter === s ? "bg-primary-600 text-white" : "bg-surface-secondary text-text-secondary hover:bg-border"}`}
          >{statusLabels[s]}</button>
        ))}
      </div>

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
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Admin Notes</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {claims.map((c) => (
                <tr key={c.id} className="bg-surface hover:bg-surface-secondary">
                  <td className="px-4 py-3 font-medium text-text-primary">{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.periodLabel || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "APPROVED" ? "bg-success/10 text-success-700" : c.status === "REJECTED" ? "bg-error/10 text-error-500" : "bg-warning-50 text-warning-500"
                    }`}>
                      {c.status === "APPROVED" && <CheckCircle size={12} className="mr-1 inline" />}
                      {c.status === "REJECTED" && <XCircle size={12} className="mr-1 inline" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{c.adminNotes || "-"}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="touch-target rounded-lg border border-border px-4 py-2 text-sm text-text-primary disabled:opacity-40">Previous</button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="touch-target rounded-lg border border-border px-4 py-2 text-sm text-text-primary disabled:opacity-40">Next</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-heading text-text-primary">New Payment Claim</h2>
              <button type="button" onClick={() => setShowForm(false)} className="touch-target rounded-lg p-1.5 text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Amount (KES) *</label>
                <input type="number" min="1" step="0.01" required value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Period</label>
                <input type="text" value={formPeriod} onChange={(e) => setFormPeriod(e.target.value)} placeholder="e.g. July 2026"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
                <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} placeholder="Reason for claim..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15 resize-none" />
              </div>
              <button type="submit" disabled={submitting || !formAmount}
                className="w-full touch-target rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >{submitting ? <Loader2 size={16} className="animate-spin" /> : null}{submitting ? "Submitting..." : "Submit Claim"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
