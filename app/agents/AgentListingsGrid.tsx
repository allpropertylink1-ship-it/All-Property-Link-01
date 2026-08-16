"use client"

import { PropertyCard } from "@/components/property/PropertyCard";
import type { AgentListing } from "@/lib/services/agent";

interface Props {
  listings: AgentListing[];
}

export function AgentListingsGrid({ listings }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}