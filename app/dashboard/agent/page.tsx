/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Users, DollarSign, Clock, ArrowRight, Eye, Receipt } from "@/components/ui/icons"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { StatusPill } from "@/components/shared/StatusPill"
import { fmtKES } from "@/lib/utils"

interface AgentData {
  agent: {
    id: string
    fullName: string
    email: string
    phone: string
    agentCode: string
    createdAt: string
  }
  stats: {
    totalReferrals: number
    totalProperties: number
    pendingClaims: number
    paidClaims: number
    totalPaid: number
  }
  recentReferrals: {
    id: string
    firstName: string
    lastName: string
    email: string
    createdAt: string
    properties: { id: string; title: string; status: string }[]
  }[]
  recentClaims: {
    id: string
    amount: number
    status: string
    paidAt: string | null
    adminModifiedAmount: number | null
    property: { title: string } | null
  }[]
}

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    const res = await api.get<AgentData>("/api/referral-partner/dashboard")
    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setData(res.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user && user.authMethod !== "agent") {
      setLoading(false)
      return
    }
    fetchDashboard()
  }, [user, fetchDashboard])

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="mb-2 h-7 w-72 animate-pulse rounded-md bg-border" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-border" />
        </div>
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 h-10 w-10 animate-pulse rounded-lg bg-border" />
              <div className="mb-1 h-8 w-20 animate-pulse rounded-md bg-border" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-border" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 h-5 w-32 animate-pulse rounded-md bg-border" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 animate-pulse rounded-md bg-border" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Something went wrong</h2>
          <p className="mb-6 text-sm text-text-secondary">{error}</p>
          <button
            type="button"
            onClick={fetchDashboard}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const statCards = [
    { label: "Total Referrals", value: data.stats.totalReferrals, icon: Users, color: "bg-primary-50 text-primary-700", href: "/dashboard/agent/referrals" },
    { label: "Total Paid", value: fmtKES(data.stats.totalPaid), icon: DollarSign, color: "bg-success-50 text-success-700", href: "/dashboard/agent/claims" },
    { label: "Pending Claims", value: data.stats.pendingClaims, icon: Clock, color: "bg-warning-50 text-warning-700", href: "/dashboard/agent/claims" },
    { label: "Paid Claims", value: data.stats.paidClaims, icon: Receipt, color: "bg-accent-50 text-accent-700", href: "/dashboard/agent/claims" },
  ]

  const quickActions = [
    { label: "Submit a Claim", href: "/dashboard/agent/claims", icon: Receipt, color: "bg-primary-50 text-primary-700" },
    { label: "View Referrals", href: "/dashboard/agent/referrals", icon: Users, color: "bg-success-50 text-success-700" },
    { label: "View Claims", href: "/dashboard/agent/claims", icon: DollarSign, color: "bg-warning-50 text-warning-700" },
    { label: "View Disputes", href: "/dashboard/agent/disputes", icon: Eye, color: "bg-accent-50 text-accent-700" },
  ]

  return (
    <AgentGuard message="You don&apos;t have access to the APL Representative Dashboard. Only registered representatives can view this page.">
      {/* Stitch commission-hub header */}
      <section aria-labelledby="agent-heading" className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Representative dashboard &middot; Commission hub
        </p>
        <h1 id="agent-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">APL Representative Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {data.agent.fullName} &middot; Code: <span className="font-mono font-semibold uppercase text-text-primary">{data.agent.agentCode}</span>
        </p>
      </section>

      <section aria-labelledby="agent-stats-heading" className="mb-6">
        <h2 id="agent-stats-heading" className="sr-only">Performance metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.label} href={card.href} className="block rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm" aria-label={`${card.label}: ${card.value}`}>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
                <p className="font-heading text-2xl font-bold tracking-tight text-text-primary">{card.value}</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{card.label}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="agent-actions-heading" className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="agent-actions-heading" className="mb-1 font-heading text-base font-semibold text-text-primary">Quick Actions</h2>
        <p className="mb-4 text-sm text-text-secondary">Claims, referrals, and disputes in one tap.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href} className="touch-target flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="truncate text-sm font-medium text-text-primary">{action.label}</span>
                </div>
                <ArrowRight size={16} className="shrink-0 text-muted" />
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-referrals-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 id="recent-referrals-heading" className="font-heading text-base font-semibold text-text-primary">Recent Referrals</h3>
            <Link href="/dashboard/agent/referrals" className="touch-target inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <p className="mb-4 text-sm text-text-secondary">Latest people who joined with your code.</p>
          {data.recentReferrals.length === 0 ? (
            <p className="rounded-lg bg-surface-secondary px-4 py-6 text-center text-sm text-text-secondary" role="status">No referrals yet</p>
          ) : (
            <ul className="space-y-3">
              {data.recentReferrals.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/agent/referrals/${r.id}`} className="touch-target flex items-center justify-between gap-2 rounded-lg bg-surface-secondary p-3 transition-colors hover:bg-surface">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{r.firstName} {r.lastName}</p>
                      <p className="truncate text-xs text-text-secondary">{r.email}</p>
                      <p className="text-xs text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-claims-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 id="recent-claims-heading" className="font-heading text-base font-semibold text-text-primary">Recent Claims</h3>
            <Link href="/dashboard/agent/claims" className="touch-target inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <p className="mb-4 text-sm text-text-secondary">Latest commission requests and their status.</p>
          {data.recentClaims.length === 0 ? (
            <p className="rounded-lg bg-surface-secondary px-4 py-6 text-center text-sm text-text-secondary" role="status">No claims yet</p>
          ) : (
            <ul className="space-y-3">
              {data.recentClaims.map((c) => (
                <li key={c.id} className="rounded-lg bg-surface-secondary p-3">
                  <p className="truncate text-sm font-medium text-text-primary">{c.property?.title || "No property"}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary">{fmtKES(c.adminModifiedAmount ?? c.amount)}</span>
                    <StatusPill status={c.status} label={c.status === "AWAITING_AGENT_ACCEPTANCE" ? "AWAITING YOU" : c.status} />
                  </div>
                  {c.paidAt && <p className="mt-0.5 text-xs text-text-secondary">{new Date(c.paidAt).toLocaleDateString()}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AgentGuard>
  )
}
