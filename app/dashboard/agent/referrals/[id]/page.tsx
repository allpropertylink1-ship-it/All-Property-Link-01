/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Building2, ArrowLeft } from "@/components/ui/icons"
import Link from "next/link"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { StatusPill } from "@/components/shared/StatusPill"
import { fmtKES } from "@/lib/utils"
import { resolveImageUrl } from "@/lib/images";

interface Property {
  id: string
  title: string
  slug: string
  price: number
  currency: string
  propertyType: string
  city: string
  status: string
  moderationStatus: string
  images: string | { url: string }[] | null
  createdAt: string
}

interface ReferralDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  category: string | null
  kycStatus: string
  accountStatus: string
  createdAt: string
  properties: Property[]
}

export default function AgentReferralDetailPage() {
  const params = useParams()
  const [referral, setReferral] = useState<ReferralDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchReferral = useCallback(async () => {
    setLoading(true)
    setError("")
    const { data, error } = await api.get<{ referral: ReferralDetail }>(`/api/referral-partner/referrals/${params.id}`)
    if (data) setReferral(data.referral)
    else setError(error || "Failed to load")
    setLoading(false)
  }, [params.id])

  useEffect(() => { fetchReferral() }, [fetchReferral])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
  if (error) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <AlertCircle size={24} className="text-error-500" />
      <p className="text-sm text-text-secondary">{error}</p>
    </div>
  )
  if (!referral) return null

  return (
    <AgentGuard>
      <Link href="/dashboard/agent/referrals" className="mb-6 inline-flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back to referrals
      </Link>

      <div className="mb-8 rounded-xl border border-border bg-surface p-6">
        <h1 className="mb-1 font-heading text-2xl font-bold text-text-primary">{referral.firstName} {referral.lastName}</h1>
        <p className="text-sm text-text-secondary">{referral.email}</p>
        {referral.phone && <p className="text-sm text-text-secondary">{referral.phone}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {referral.category && <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-secondary">{referral.category}</span>}
          <StatusPill status={referral.kycStatus} label={`KYC: ${referral.kycStatus}`} />
        </div>
      </div>

      <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Properties ({referral.properties.length})</h2>

      {referral.properties.length === 0 ? (
        <p className="text-sm text-text-secondary">No properties listed yet</p>
      ) : (
        <div className="space-y-3">
          {referral.properties.map((p) => {
            const img = Array.isArray(p.images) ? p.images[0] : null
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
                <Link href={`/properties/${p.city?.toLowerCase() || "unknown"}/${p.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  {img ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                      <img src={resolveImageUrl(typeof img === "string" ? img : img.url) ?? undefined} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                      <Building2 size={20} className="text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{p.title}</p>
                    <p className="text-xs text-text-secondary">{p.city} &middot; {p.propertyType}</p>
                    <p className="text-sm font-semibold text-text-primary">{fmtKES(p.price)}</p>
                  </div>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusPill status={p.moderationStatus} label={p.status} />
                  <Link href={`/dashboard/agent/referrals/${referral.id}/properties/${p.id}/edit`} className="rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100">
                    Edit
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AgentGuard>
  )
}
