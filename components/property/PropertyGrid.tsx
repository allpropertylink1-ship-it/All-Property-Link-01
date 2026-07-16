import { PropertyCard } from "./PropertyCard";

interface PropertyGridProps {
  properties: {
    id: string;
    slug: string;
    title: string;
    price: number;
    currency: string;
    propertyType: string;
    listingPurpose?: string | null;
    city: string;
    region: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    images: unknown;
    isFeatured: boolean;
    createdAt: Date;
    urgencyText?: "Trending" | "Just listed" | "Popular";
    isVerified?: boolean;
  }[];
  viewToggle?: "grid" | "list";
}

export function PropertyGrid({ properties, viewToggle = "grid" }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-secondary">No properties found</p>
      </div>
    );
  }

  return (
    <div
      className={
        viewToggle === "grid"
          ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
          : "flex flex-col gap-4"
      }
    >
      {properties.map((property, i) => (
        <PropertyCard key={property.id} priority={i === 0} {...property} />
      ))}
    </div>
  );
}
