"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Loader2, AlertCircle, Building2 } from "lucide-react"

interface Payout {
  id: string
  amount: number
  currency: string
  method: string
  reference: string | null
  status: string
  notes: string | null
  paidAt: string | null
  createdAt: string
}

const fmt = (n: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n)

const statuses = ["", "PENDING", "PAID", "CANCELLED"] as const
const statusLabels: Record<string, string> = { "": "All", PENDING: "Pending", PAID: "Paid", CANCELLED: "Cancelled" }

export default function AgentPayoutsPage() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (statusFilter) params.set("status", statusFilter)
    const { data, error } = await api.get<{ payouts: Payout[]; total: number; totalPages: number }>(`/api/agent/payouts?${params}`)
    if (data) {
      setPayouts(data.payouts)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } else {
      setError(error || "Failed to load")
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchPayouts() }, [fetchPayouts])

  if (!user?.isAgent) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary">Only APL Representatives can view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Payouts</h1>
        <p className="mt-1 text-sm text-text-secondary">{total} total payout{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="mb-4 flex gap-2">
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
          <button type="button" onClick={fetchPayouts} className="touch-target rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white">Retry</button>
        </div>
      ) : payouts.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-secondary">No payouts found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payouts.map((p) => (
                <tr key={p.id} className="bg-surface hover:bg-surface-secondary">
                  <td className="px-4 py-3 font-medium text-text-primary">{fmt(p.amount)}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.method}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.reference || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "PAID" ? "bg-success/10 text-success-700" : p.status === "CANCELLED" ? "bg-error/10 text-error-500" : "bg-warning-50 text-warning-500"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
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
    </div>
  )
}