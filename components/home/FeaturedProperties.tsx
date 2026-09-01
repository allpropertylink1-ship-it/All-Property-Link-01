"use client"

import { useEffect, useState } from "react"
import { FeaturedSection } from "./FeaturedSection"
import { PropertyCard } from "@/components/property/PropertyCard"

interface ApiProperty {
  slug: string; title: string; price: number | null; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; images: unknown;
  isFeatured: boolean; createdAt: string | Date;
}

export function FeaturedProperties({ initialData }: { initialData?: ApiProperty[] }) {
  const [properties, setProperties] = useState<ApiProperty[]>(
    (initialData || []).filter((p) => p.listingPurpose !== "FOR_RENT_SHORT_TERM")
  )
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
    fetch("/api/properties?limit=6")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { properties: ApiProperty[] }) => {
        setProperties((data.properties || []).filter((p) => p.listingPurpose !== "FOR_RENT_SHORT_TERM"))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [initialData])

  return (
    <FeaturedSection title="Properties for Sale & Rent" viewAllHref="/properties" loading={loading} error={error ?? undefined} emptyMessage={!loading && !error && properties.length === 0 ? "No properties listed yet." : undefined}>
      {properties.length > 0 && (
        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.slug} slug={p.slug} title={p.title} price={p.price == null ? null : Number(p.price)} currency={p.currency}
              propertyType={p.propertyType} listingPurpose={p.listingPurpose} city={p.city} region={p.region}
              images={p.images} isFeatured={p.isFeatured} bedrooms={null} bathrooms={null} area={null} priority={i === 0} />
          ))}
        </div>
      )}
    </FeaturedSection>
  )
}
