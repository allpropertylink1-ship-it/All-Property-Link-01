"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import Link from "next/link"
import { Building2, Users, DollarSign, Clock, Wallet, ArrowRight, Eye } from "@/components/ui/icons"

interface AgentData {
  agent: {
    id: string
    fullName: string
    email: string
    phone: string
    agentCode: string
    commissionRate: number
    commissionType: string
    createdAt: string
  }
  stats: {
    totalReferrals: number
    totalProperties: number
    pendingCommissions: number
    paidCommissions: number
    totalEarned: number
    pendingPayouts: number
    totalPaidOut: number
  }
  recentReferrals: {
    id: string
    firstName: string
    lastName: string
    email: string
    createdAt: string
    properties: { id: string; title: string; status: string }[]
  }[]
  recentCommissions: {
    id: string
    amount: number
    status: string
    paidAt: string | null
    property: { title: string }
    user: { firstName: string; lastName: string }
  }[]
  recentPayouts: {
    id: string
    amount: number
    method: string
    reference: string | null
    status: string
    paidAt: string | null
  }[]
}

export default function AgentDashboardPage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
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

  if (!user || user.authMethod !== "agent") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
          <p className="text-sm text-text-secondary">You don&apos;t have access to the APL Representative Dashboard. Only registered representatives can view this page.</p>
        </div>
      </div>
    )
  }

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
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
    { label: "Total Referrals", value: data.stats.totalReferrals, icon: Users, color: "bg-primary-50 text-primary-600", href: "/dashboard/agent/referrals" },
    { label: "Total Earned", value: `KES ${data.stats.totalEarned.toLocaleString()}`, icon: DollarSign, color: "bg-success-50 text-success-700", href: "/dashboard/agent/payouts" },
    { label: "Pending Commissions", value: data.stats.pendingCommissions, icon: Clock, color: "bg-warning-50 text-warning-500", href: "/dashboard/agent/commissions" },
    { label: "Pending Payouts", value: data.stats.pendingPayouts, icon: Wallet, color: "bg-accent-50 text-accent-500", href: "/dashboard/agent/payouts" },
  ]

  const quickActions = [
    { label: "View Commissions", href: "/dashboard/agent/commissions", icon: DollarSign, color: "bg-primary-50 text-primary-600" },
    { label: "View Payouts", href: "/dashboard/agent/payouts", icon: Wallet, color: "bg-success-50 text-success-700" },
    { label: "View Referrals", href: "/dashboard/agent/referrals", icon: Users, color: "bg-warning-50 text-warning-500" },
    { label: "View Disputes", href: "/dashboard/agent/disputes", icon: Eye, color: "bg-accent-50 text-accent-500" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1 font-heading text-2xl font-bold text-text-primary">APL Representative Dashboard</h1>
        <p className="text-sm text-text-secondary">
          {data.agent.fullName} &middot; Code: {data.agent.agentCode}
        </p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="block rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-sm">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{card.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href} className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium text-text-primary">{action.label}</span>
              </div>
              <ArrowRight size={16} className="shrink-0 text-muted" />
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Recent Referrals</h3>
          {data.recentReferrals.length === 0 ? (
            <p className="text-sm text-text-secondary">No referrals yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentReferrals.map((r) => (
                <Link key={r.id} href={`/dashboard/agent/referrals/${r.id}`} className="flex items-center justify-between rounded-lg bg-surface-secondary p-3 transition-colors hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{r.firstName} {r.lastName}</p>
                    <p className="truncate text-xs text-text-secondary">{r.email}</p>
                    <p className="text-xs text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-muted" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/dashboard/agent/referrals" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Recent Commissions</h3>
          {data.recentCommissions.length === 0 ? (
            <p className="text-sm text-text-secondary">No commissions yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentCommissions.map((c) => (
                <div key={c.id} className="rounded-lg bg-surface-secondary p-3">
                  <p className="truncate text-sm font-medium text-text-primary">{c.property.title}</p>
                  <p className="text-xs text-text-secondary">{c.user.firstName} {c.user.lastName}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">KES {c.amount.toLocaleString()}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.status === "PAID" ? "bg-success-500/10 text-success-700" : "bg-warning-50 text-warning-500"
                    }`}>{c.status}</span>
                  </div>
                  {c.paidAt && <p className="mt-0.5 text-[10px] text-text-secondary">{new Date(c.paidAt).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/agent/commissions" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Recent Payouts</h3>
          {data.recentPayouts.length === 0 ? (
            <p className="text-sm text-text-secondary">No payouts yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayouts.map((p) => (
                <div key={p.id} className="rounded-lg bg-surface-secondary p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">KES {p.amount.toLocaleString()}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      p.status === "PAID" ? "bg-success-500/10 text-success-700" : "bg-warning-50 text-warning-500"
                    }`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{p.method}{p.reference ? ` - ${p.reference}` : ""}</p>
                  {p.paidAt && <p className="text-[10px] text-text-secondary">{new Date(p.paidAt).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/agent/payouts" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
