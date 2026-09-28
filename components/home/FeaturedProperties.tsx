"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { PropertyCard } from "@/components/property/PropertyCard"

interface ApiProperty {
  slug: string; title: string; price: number | null; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; images: unknown; coverImage?: string | null; thumbUrl?: string | null;
  bedrooms?: number | null; bathrooms?: number | null; area?: number | null;
  isFeatured: boolean; createdAt: string | Date;
}

function isSaleOrRent(p: ApiProperty) {
  return p.listingPurpose !== "FOR_RENT_SHORT_TERM" && p.propertyType !== "LAND"
}

function cardProps(p: ApiProperty, priority: boolean) {
  return {
    slug: p.slug,
    title: p.title,
    price: p.price == null ? null : Number(p.price),
    currency: p.currency,
    propertyType: p.propertyType,
    listingPurpose: p.listingPurpose,
    city: p.city,
    region: p.region,
    images: p.images,
    coverImage: p.coverImage ?? null,
    thumbUrl: p.thumbUrl ?? null,
    isFeatured: p.isFeatured,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    area: p.area ?? null,
    priority,
  }
}

function FullSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[16/10] bg-surface-secondary" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-2/3 rounded bg-surface-secondary" />
        <div className="h-3 w-1/2 rounded bg-surface-secondary" />
        <div className="h-3 w-3/4 rounded bg-surface-secondary" />
      </div>
    </div>
  )
}

export function FeaturedProperties({ initialData }: { initialData?: ApiProperty[] }) {
  const [properties, setProperties] = useState<ApiProperty[]>(
    (initialData || []).filter(isSaleOrRent).slice(0, 8)
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
        setProperties((data.properties || []).filter(isSaleOrRent).slice(0, 8))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [initialData])

  return (
    <section aria-labelledby="home-featured-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="home-featured-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Featured Kenyan Properties
            </h2>
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
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden" aria-busy="true" aria-label="Loading featured properties">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[80%] shrink-0 snap-start">
                  <FullSkeleton />
                </div>
              ))}
            </div>
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4" aria-busy="true" aria-label="Loading featured properties">
              {Array.from({ length: 8 }).map((_, i) => (
                <FullSkeleton key={i} />
              ))}
            </div>
          </>
        ) : error ? (
          <FormBanner variant="error">Could not load featured properties: {error}</FormBanner>
        ) : properties.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No properties listed yet.
          </p>
        ) : (
          <>
            {/* Mobile rail: horizontal snap scroll (mobile only) */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:hidden">
              {properties.map((p, i) => (
                <div key={p.slug} className="w-[80%] shrink-0 snap-start">
                  <PropertyCard {...cardProps(p, i === 0)} />
                </div>
              ))}
            </div>
            {/* Tablet: 2-col grid / Desktop: 4-col matrix (2 rows of 4 with 8 listings) */}
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {properties.map((p, i) => (
                <PropertyCard key={p.slug} {...cardProps(p, i === 0)} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
