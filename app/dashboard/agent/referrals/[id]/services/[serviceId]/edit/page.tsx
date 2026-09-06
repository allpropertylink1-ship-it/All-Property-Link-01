"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { EditServiceForm } from "@/app/dashboard/services/[id]/edit/EditServiceForm"
import { Loader2, AlertCircle, Building2, ArrowLeft } from "@/components/ui/icons"

interface Category {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

interface AgentService {
  id: string
  categoryId: string
  title: string
  description: string
  price: number | string | null
  currency: string
  pricePeriod: string
  location: string | null
  city: string | null
  region: string | null
  images: string[] | null
  category: { id: string; name: string; slug: string }
}

export default function AgentEditReferralServicePage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
  const params = useParams()
  const referralId = String(params.id)
  const serviceId = String(params.serviceId)
  const [service, setService] = useState<AgentService | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [svcRes, catRes] = await Promise.all([
      api.get<{ service: AgentService }>(
        `/api/agent/referrals/${referralId}/services/${serviceId}`
      ),
      api.get<{ categories: Category[] }>("/api/agent/services/categories"),
    ])
    if (svcRes.data) setService(svcRes.data.service)
    else setError(svcRes.error || "Failed to load service")
    if (catRes.data) setCategories(catRes.data.categories)
    setLoading(false)
  }, [referralId, serviceId])

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
  if (!service) return null

  return (
    <div>
      <Link href={`/dashboard/agent/referrals/${referralId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back to referral
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">Edit service</h1>
      <p className="mb-8 text-sm text-text-secondary">Your edits are saved for review under your referral&apos;s account.</p>

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <EditServiceForm
          service={{
            id: service.id,
            categoryId: service.categoryId,
            title: service.title,
            description: service.description,
            price: service.price ? Number(service.price) : null,
            currency: service.currency,
            pricePeriod: service.pricePeriod,
            location: service.location,
            city: service.city,
            region: service.region,
            images: service.images || [],
            category: service.category,
          }}
          categories={categories}
          endpoint={`/api/agent/referrals/${referralId}/services/${service.id}`}
          redirectTo={`/dashboard/agent/referrals/${referralId}`}
        />
      </div>
    </div>
  )
}
