"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Search, ChevronRight, Users, Archive } from "@/components/ui/icons"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { Pagination } from "@/components/shared/Pagination"

interface Referral {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  category: string | null
  accountStatus: string
  createdAt: string
  deletedAt: string | null
  _count: { properties: number }
}

type Tab = "ACTIVE" | "DELETED"

export default function AgentReferralsPage() {
  const [tab, setTab] = useState<Tab>("ACTIVE")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = window.setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => window.clearTimeout(t)
  }, [search])

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    setError("")
    const status = tab === "DELETED" ? "DELETED" : "ACTIVE"
    const params = new URLSearchParams({ page: String(page), limit: "20", status })
    if (debouncedSearch) params.set("search", debouncedSearch)
    const { data, error } = await api.get<{ referrals: Referral[]; total: number; totalPages: number }>(`/api/referral-partner/referrals?${params}`)
    if (data) {
      setReferrals(data.referrals)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } else {
      setError(error || "Failed to load")
    }
    setLoading(false)
  }, [page, debouncedSearch, tab])

  useEffect(() => { fetchReferrals() }, [fetchReferrals])

  useEffect(() => { setSearch(""); setPage(1) }, [tab])

  return (
    <AgentGuard>
      <section aria-labelledby="referrals-heading" className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Commission hub
        </p>
        <h1 id="referrals-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">Referrals</h1>
        <p className="mt-1 text-sm text-text-secondary">{total} {tab === "DELETED" ? "deleted" : "active"} referral{total !== 1 ? "s" : ""}</p>
      </section>

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface-secondary p-1" role="group" aria-label="Referral status filter">
        <button type="button" onClick={() => setTab("ACTIVE")} aria-pressed={tab === "ACTIVE"}
          className={`touch-target flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none ${tab === "ACTIVE" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
          <Users size={16} /> Active
        </button>
        <button type="button" onClick={() => setTab("DELETED")} aria-pressed={tab === "DELETED"}
          className={`touch-target flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none ${tab === "DELETED" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
          <Archive size={16} /> Deleted
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." aria-label="Search referrals by name or email"
          className="min-h-[44px] w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-4 text-base text-text-primary placeholder:text-text-secondary focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <AlertCircle size={24} className="text-error-500" />
          <p className="text-sm text-text-secondary">{error}</p>
          <button type="button" onClick={fetchReferrals} className="touch-target rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white">Retry</button>
        </div>
      ) : referrals.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-20 text-center text-sm text-text-secondary" role="status">
          {tab === "DELETED" ? "No deleted referrals" : "No referrals found"}
        </div>
      ) : (
        <section aria-label={tab === "DELETED" ? "Deleted referrals" : "Active referrals"} className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                <th scope="col" className="px-4 py-3 font-medium">Properties</th>
                <th scope="col" className="px-4 py-3 font-medium">{tab === "DELETED" ? "Deleted" : "Joined"}</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {referrals.map((r) => (
                <tr key={r.id} className={`bg-surface hover:bg-surface-secondary ${r.deletedAt ? "opacity-70" : ""}`}>
                  <td className="px-4 py-3 text-text-primary">{r.firstName} {r.lastName}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.phone || "-"}</td>
                  <td className="px-4 py-3 text-text-secondary">{r._count.properties}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {r.deletedAt ? new Date(r.deletedAt).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/agent/referrals/${r.id}`} className="touch-target inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
    </AgentGuard>
  )
}
