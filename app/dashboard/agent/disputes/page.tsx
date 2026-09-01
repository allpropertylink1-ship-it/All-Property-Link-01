"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Plus, ChevronRight } from "@/components/ui/icons"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { StatusPill } from "@/components/shared/StatusPill"
import { Pagination } from "@/components/shared/Pagination"
import { fmtKES } from "@/lib/utils"

interface Dispute {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: string
  resolution: string | null
  createdAt: string
  updatedAt: string
}

const statuses = ["", "PENDING", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const
const statusLabels: Record<string, string> = { "": "All", PENDING: "Pending", UNDER_REVIEW: "Under Review", RESOLVED: "Resolved", REJECTED: "Rejected" }

export default function AgentDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    setError("")
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (statusFilter) params.set("status", statusFilter)
    const { data, error } = await api.get<{ disputes: Dispute[]; total: number; totalPages: number }>(`/api/referral-partner/disputes?${params}`)
    if (data) {
      setDisputes(data.disputes)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } else {
      setError(error || "Failed to load")
    }
    setLoading(false)
  }, [page, statusFilter])

  useEffect(() => { fetchDisputes() }, [fetchDisputes])

  return (
    <AgentGuard>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Disputes</h1>
          <p className="mt-1 text-sm text-text-secondary">{total} total dispute{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/agent/disputes/new" className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700">
          <Plus size={16} /> New Dispute
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
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
          <button type="button" onClick={fetchDisputes} className="touch-target rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white">Retry</button>
        </div>
      ) : disputes.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-secondary">No disputes found</div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Link key={d.id} href={`/dashboard/agent/disputes/${d.id}`} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{d.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">{d.description}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-primary">{fmtKES(d.amount)}</span>
                  <StatusPill status={d.status} />
                  <span className="text-[10px] text-text-secondary">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </AgentGuard>
  )
}
