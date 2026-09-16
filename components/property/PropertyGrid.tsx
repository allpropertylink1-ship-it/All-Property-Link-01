import { PropertyCard } from "./PropertyCard";

interface PropertyGridProps {
  properties: {
    id: string;
    slug: string;
    title: string;
    price: number | null;
    currency: string;
    propertyType: string;
    listingPurpose?: string | null;
    city: string;
    region: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    images: unknown;
    coverImage?: string | null;
    isFeatured: boolean;
    createdAt: Date | string;
    urgencyText?: "Trending" | "Just listed" | "Popular";
    isVerified?: boolean;
  }[];
  viewToggle?: "grid" | "list";
  /** "sidebar" when rendered beside the sticky filter rail (3-col max), "full" otherwise (4-col max) */
  variant?: "full" | "sidebar";
}

export function PropertyGrid({ properties, viewToggle = "grid", variant = "full" }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-16 text-center" role="status">
        <p className="font-medium text-text-primary">No properties found</p>
        <p className="mt-1 text-sm text-text-secondary">Try adjusting your search or filters.</p>
      </div>
    );
  }

  if (viewToggle === "list") {
    return (
      <div className="flex flex-col gap-4" role="list" aria-label="Property list">
        {properties.map((property) => (
          <PropertyCard key={property.id} priority={false} variant="compact" {...property} />
        ))}
      </div>
    );
  }

  const gridClass =
    variant === "sidebar"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
      : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridClass} role="list" aria-label="Property grid">
      {properties.map((property, i) => (
        <PropertyCard key={property.id} priority={i === 0} {...property} />
      ))}
    </div>
  );
}
