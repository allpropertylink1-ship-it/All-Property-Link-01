import { PropertyCard } from "./PropertyCard";

interface PropertyGridProps {
  properties: {
    id: string;
    slug: string;
    title: string;
    price: number;
    currency: string;
    propertyType: string;
    city: string;
    region: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    images: unknown;
    isFeatured: boolean;
    createdAt: Date;
  }[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-secondary">No properties found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  );
}
