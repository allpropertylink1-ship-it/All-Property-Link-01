"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"

interface ApiProperty extends LatestListCardData {
  currency: string
  isFeatured: boolean
  createdAt: string | Date
  agent?: { phone?: string | null; userTypes?: string[] | null } | null
}

function listerKindOf(p: ApiProperty): "OWNER" | "AGENT" | null {
  const types = p.agent?.userTypes ?? []
  if (types.includes("AGENT")) return "AGENT"
  if (types.includes("PROPERTY_OWNER")) return "OWNER"
  return null
}

function withPhone(p: ApiProperty): LatestListCardData {
  return { ...p, agentPhone: p.agent?.phone ?? null, listerKind: listerKindOf(p) }
}

function isSaleOrRent(p: ApiProperty) {
  return p.listingPurpose !== "FOR_RENT_SHORT_TERM" && p.propertyType !== "LAND"
}

function FullSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded border-[1.25px] border-[#E5E7EB] bg-white">
      <div className="h-[200px] w-full bg-surface-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded bg-surface-secondary" />
        <div className="h-3 w-1/2 rounded bg-surface-secondary" />
        <div className="h-3 w-3/4 rounded bg-surface-secondary" />
      </div>
    </div>
  )
}

export function FeaturedProperties({ initialData }: { initialData?: ApiProperty[] }) {
  const [properties, setProperties] = useState<ApiProperty[]>(
    (initialData || []).filter(isSaleOrRent).slice(0, 6)
  )
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
    // Source HOUSE directly: unfiltered fetch returns mostly LAND, which this
    // section filters out (leaving a near-empty grid). 632 HOUSE live.
    fetch("/api/properties?type=HOUSE&limit=12")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { properties: ApiProperty[] }) => {
        setProperties((data.properties || []).filter(isSaleOrRent).slice(0, 6))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [initialData])

  return (
    <section aria-labelledby="home-latest-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="home-latest-heading" className="font-poppins text-[28px] font-semibold leading-tight tracking-tight text-text-primary sm:text-[32px]">
              Latest Properties
            </h2>
            <p className="mt-2 font-poppins text-base font-normal leading-6 text-text-secondary">
              Find Your Dream Property
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Listings
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide lg:hidden" aria-busy="true" aria-label="Loading latest properties">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[78%] shrink-0 snap-start sm:w-[45%]">
                  <FullSkeleton />
                </div>
              ))}
            </div>
            <div className="hidden gap-4 lg:grid lg:grid-cols-2" aria-busy="true" aria-label="Loading latest properties">
              {Array.from({ length: 6 }).map((_, i) => (
                <FullSkeleton key={i} />
              ))}
            </div>
          </>
        ) : error ? (
          <FormBanner variant="error">Could not load latest properties: {error}</FormBanner>
        ) : properties.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No properties listed yet.
          </p>
        ) : (
          <>
            {/* Mobile + tablet rail: horizontal snap scroll */}
            <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide lg:hidden">
              {properties.map((p, i) => (
                <div key={p.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%]">
                  <LatestListCard item={withPhone(p)} priority={i === 0} />
                </div>
              ))}
            </div>
            {/* Desktop: 2 columns x 3 rows */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-2">
              {properties.map((p, i) => (
                <LatestListCard key={p.slug} item={withPhone(p)} priority={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
