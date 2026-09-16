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
      <div className="aspect-[4/3] bg-surface-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded bg-surface-secondary" />
        <div className="h-3 w-1/2 rounded bg-surface-secondary" />
      </div>
    </div>
  )
}

function MiniSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[4/3] bg-surface-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-surface-secondary" />
        <div className="h-3 w-1/2 rounded bg-surface-secondary" />
      </div>
    </div>
  )
}

export function FeaturedProperties({ initialData }: { initialData?: ApiProperty[] }) {
  const [properties, setProperties] = useState<ApiProperty[]>(
    (initialData || []).filter(isSaleOrRent)
  )
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
    fetch("/api/properties?limit=6")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { properties: ApiProperty[] }) => {
        setProperties((data.properties || []).filter(isSaleOrRent))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [initialData])

  return (
    <section aria-labelledby="home-featured-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
              Direct Owner &amp; Developer Listings
            </p>
            <h2 id="home-featured-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Featured Kenyan Properties
            </h2>
            <p className="mt-1 max-w-text text-sm text-text-secondary">
              Hand-vetted residential titles across Nairobi &amp; Kiambu with zero hidden agent fees.
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
            <div className="flex flex-col gap-4 lg:hidden" aria-busy="true" aria-label="Loading featured properties">
              {Array.from({ length: 3 }).map((_, i) => (
                <FullSkeleton key={i} />
              ))}
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <MiniSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="hidden gap-4 lg:grid lg:grid-cols-4" aria-busy="true" aria-label="Loading featured properties">
              {Array.from({ length: 4 }).map((_, i) => (
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
            {/* Mobile feed: full cards first, then a 2-up compact grid (Stitch mobile home) */}
            <div className="flex flex-col gap-4 lg:hidden">
              {properties.slice(0, 3).map((p, i) => (
                <PropertyCard key={p.slug} {...cardProps(p, i === 0)} />
              ))}
              {properties.length > 3 && (
                <div className="grid grid-cols-2 gap-4">
                  {properties.slice(3, 5).map((p) => (
                    <PropertyCard key={p.slug} {...cardProps(p, false)} />
                  ))}
                </div>
              )}
            </div>
            {/* Desktop: 4-column matrix (Stitch desktop home) */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-4">
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
