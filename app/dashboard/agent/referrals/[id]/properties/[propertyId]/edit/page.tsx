"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { Loader2, AlertCircle, Building2, ArrowLeft } from "@/components/ui/icons"
import Link from "next/link"
import EditListingForm from "@/app/dashboard/listings/[id]/edit/EditListingForm"

interface EditableProperty {
  id: string
  title: string
  description: string
  price: number | null
  propertyType: "APARTMENT" | "HOUSE" | "LAND" | "COMMERCIAL"
  listingPurpose?: "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | null
  city: string
  region: string
  address: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  features?: string[]
  images?: string[]
  latitude?: number | null
  longitude?: number | null
}

export default function AgentEditReferralPropertyPage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
  const params = useParams()
  const referralId = String(params.id)
  const propertyId = String(params.propertyId)
  const [property, setProperty] = useState<EditableProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProperty = useCallback(async () => {
    setLoading(true)
    const { data, error } = await api.get<{ property: EditableProperty }>(`/api/agent/referrals/${referralId}/properties/${propertyId}`)
    if (data) setProperty(data.property)
    else setError(error || "Failed to load property")
    setLoading(false)
  }, [referralId, propertyId])

  useEffect(() => { fetchProperty() }, [fetchProperty])

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
  if (!property) return null

  return (
    <div>
      <Link href={`/dashboard/agent/referrals/${referralId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-accent-300 hover:text-accent-400">
        <ArrowLeft size={16} /> Back to referral
      </Link>

      <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">Edit listing</h1>
      <p className="mb-8 text-sm text-text-secondary">Help {property.title ? `"${property.title}"` : "this listing"} rank better. Your edits are saved for review and never change the listing URL.</p>

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <EditListingForm
          propertyId={property.id}
          redirectTo={`/dashboard/agent/referrals/${referralId}`}
          property={{
            title: property.title,
            description: property.description,
            price: property.price == null ? null : Number(property.price),
            propertyType: property.propertyType,
            listingPurpose: property.listingPurpose ?? undefined,
            city: property.city,
            region: property.region,
            address: property.address,
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms ?? undefined,
            area: property.area ?? undefined,
            features: (property.features as string[]) ?? undefined,
            images: (property.images as string[]) ?? undefined,
            latitude: property.latitude ?? undefined,
            longitude: property.longitude ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
