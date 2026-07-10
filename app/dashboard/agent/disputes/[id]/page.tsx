"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { Loader2, AlertCircle, Building2, ArrowLeft } from "lucide-react"

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

const fmt = (n: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n)

const statusLabels: Record<string, string> = { PENDING: "Pending", UNDER_REVIEW: "Under Review", RESOLVED: "Resolved", REJECTED: "Rejected" }
const statusColors: Record<string, string> = {
  PENDING: "bg-warning-50 text-warning-500",
  UNDER_REVIEW: "bg-blue-50 text-blue-600",
  RESOLVED: "bg-success/10 text-success-700",
  REJECTED: "bg-error/10 text-error-500",
}

export default function AgentDisputeDetailPage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
  const params = useParams()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchDispute = useCallback(async () => {
    setLoading(true)
    const { data, error } = await api.get<{ dispute: Dispute }>(`/api/agent/disputes/${params.id}`)
    if (data) setDispute(data.dispute)
    else setError(error || "Failed to load")
    setLoading(false)
  }, [params.id])

  useEffect(() => { fetchDispute() }, [fetchDispute])

  if (user?.authMethod !== "agent") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </div>
    )
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
  if (error) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <AlertCircle size={24} className="text-error-500" />
      <p className="text-sm text-text-secondary">{error}</p>
    </div>
  )
  if (!dispute) return null

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/agent/disputes" className="mb-6 inline-flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back to disputes
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{dispute.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">Submitted {new Date(dispute.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[dispute.status] || ""}`}>{statusLabels[dispute.status] || dispute.status}</span>
        </div>

        <div className="mb-6 rounded-lg bg-surface-secondary p-4">
          <p className="text-xs text-text-secondary">Disputed Amount</p>
          <p className="text-xl font-bold text-text-primary">{fmt(dispute.amount)}</p>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 font-heading text-sm font-semibold text-text-primary">Description</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.description}</p>
        </div>

        {dispute.resolution && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 font-heading text-sm font-semibold text-text-primary">Resolution</h3>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.resolution}</p>
            {dispute.status === "RESOLVED" && (
              <p className="mt-2 text-xs text-success-700 font-medium">Resolved</p>
            )}
            {dispute.status === "REJECTED" && (
              <p className="mt-2 text-xs text-error-500 font-medium">Rejected</p>
            )}
          </div>
        )}

        {dispute.status === "PENDING" && (
          <p className="mt-4 text-xs text-text-secondary">This dispute is pending review by the admin team.</p>
        )}
        {dispute.status === "UNDER_REVIEW" && (
          <p className="mt-4 text-xs text-blue-600 font-medium">This dispute is currently being reviewed.</p>
        )}
      </div>
    </div>
  )
}