"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { PropertyCard } from "@/components/property/PropertyCard"

interface ApiProperty {
  slug: string; title: string; price: number | null; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; images: unknown;
  isFeatured: boolean; createdAt: string | Date;
}

export function FeaturedAirbnbs({ initialData }: { initialData?: ApiProperty[] }) {
  const [properties, setProperties] = useState<ApiProperty[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
    fetch("/api/properties?purpose=FOR_RENT_SHORT_TERM&limit=6")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { properties: ApiProperty[] }) => {
        setProperties(data.properties || [])
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [initialData])

  return (
    <section aria-labelledby="home-airbnb-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
              Instant Booking Stays
            </p>
            <h2 id="home-airbnb-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Featured Airbnbs
            </h2>
            <p className="mt-1 max-w-text text-sm text-text-secondary">
              Short-term stays with reliable amenities &amp; WiFi.
            </p>
          </div>
          <Link
            href="/properties?purpose=FOR_RENT_SHORT_TERM"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Stays
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible" aria-busy="true" aria-label="Loading featured airbnbs">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[270px] shrink-0 animate-pulse snap-start overflow-hidden rounded-xl border border-border bg-surface min-[480px]:w-[300px] md:w-auto">
                <div className="aspect-[4/3] bg-surface-secondary" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 rounded bg-surface-secondary" />
                  <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <FormBanner variant="error">Could not load featured stays: {error}</FormBanner>
        ) : properties.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No short-term rentals listed yet.
          </p>
        ) : (
          <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {properties.map((p, i) => (
              <div key={p.slug} className="w-[270px] shrink-0 snap-start min-[480px]:w-[300px] md:w-auto">
                <PropertyCard slug={p.slug} title={p.title} price={p.price == null ? null : Number(p.price)} currency={p.currency}
                  propertyType={p.propertyType} listingPurpose={p.listingPurpose} city={p.city} region={p.region}
                  images={p.images} isFeatured={p.isFeatured} bedrooms={null} bathrooms={null} area={null} priority={i === 0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
