"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { NewServiceForm } from "@/app/dashboard/services/new/NewServiceForm"
import { Loader2, AlertCircle, Building2, ArrowLeft } from "@/components/ui/icons"

interface Category {
  id: string
  name: string
  slug: string
  children: Category[]
}

export default function AgentPostReferralServicePage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
  const params = useParams()
  const referralId = String(params.id)
  const [referralName, setReferralName] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [refRes, catRes] = await Promise.all([
      api.get<{ referral: { firstName: string; lastName: string } }>(
        `/api/agent/referrals/${referralId}`
      ),
      api.get<{ categories: Category[] }>("/api/agent/services/categories"),
    ])
    if (refRes.data) {
      setReferralName(`${refRes.data.referral.firstName} ${refRes.data.referral.lastName}`.trim())
    } else {
      setError(refRes.error || "Failed to load referral")
    }
    if (catRes.data) setCategories(catRes.data.categories)
    setLoading(false)
  }, [referralId])

  useEffect(() => { fetchData() }, [fetchData])

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

  return (
    <div>
      <Link href={`/dashboard/agent/referrals/${referralId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back to referral
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">
        Post a service{referralName ? ` for ${referralName}` : ""}
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        The service is created under your referral&apos;s account and goes live immediately.
      </p>

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <NewServiceForm
          categories={categories}
          endpoint={`/api/agent/referrals/${referralId}/services`}
          redirectTo={`/dashboard/agent/referrals/${referralId}`}
          requireOwnerConsent
        />
      </div>
    </div>
  )
}
