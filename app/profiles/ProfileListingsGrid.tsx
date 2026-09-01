"use client"

import { PropertyCard } from "@/components/property/PropertyCard"
import type { PropertyCard as PropertyCardData } from "@/lib/services/property"

interface Props {
  listings: PropertyCardData[]
}

export function ProfileListingsGrid({ listings }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 min-[360px]:grid-cols-2 lg:grid-cols-3">
      {listings.map((p) => (
        <PropertyCard
          key={p.id}
          slug={p.slug}
          title={p.title}
          price={p.price}
          currency={p.currency}
          propertyType={p.propertyType}
          listingPurpose={p.listingPurpose}
          city={p.city}
          region={p.region}
          bedrooms={p.bedrooms}
          bathrooms={p.bathrooms}
          area={p.area}
          images={p.images}
          isFeatured={p.isFeatured}
        />
      ))}
    </div>
  )
}
