"use client"

import { useEffect, useState } from "react"
import { FeaturedSection } from "./FeaturedSection"
import { PropertyCard } from "@/components/property/PropertyCard"

interface ApiProperty {
  slug: string; title: string; price: number; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; images: unknown;
  isFeatured: boolean; createdAt: string;
}

export function FeaturedAirbnbs() {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/properties?purpose=FOR_RENT_SHORT_TERM&limit=6")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { properties: ApiProperty[] }) => {
        setProperties(data.properties || [])
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <FeaturedSection title="Airbnbs & Short-term Stays" viewAllHref="/properties?purpose=FOR_RENT_SHORT_TERM" loading={loading} error={error ?? undefined} emptyMessage={!loading && !error && properties.length === 0 ? "No short-term rentals listed yet." : undefined}>
      {properties.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.slug} slug={p.slug} title={p.title} price={Number(p.price)} currency={p.currency}
              propertyType={p.propertyType} listingPurpose={p.listingPurpose} city={p.city} region={p.region}
              images={p.images} isFeatured={p.isFeatured} bedrooms={null} bathrooms={null} area={null} />
          ))}
        </div>
      )}
    </FeaturedSection>
  )
}
