import Link from "next/link";
import Image from "next/image";

interface PropertyCardProps {
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
}

function formatPrice(price: number, currency: string) {
  return `${currency} ${Number(price).toLocaleString()}`;
}

export function PropertyCard({
  slug,
  title,
  price,
  currency,
  propertyType,
  city,
  region,
  bedrooms,
  bathrooms,
  area,
  images,
  isFeatured,
}: PropertyCardProps) {
  const imageUrls = Array.isArray(images) ? images : [];
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : "/placeholder.jpg";

  return (
    <Link
      href={`/properties/${city.toLowerCase()}/${slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        {isFeatured && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-warning-500 px-2 py-0.5 text-xs font-medium text-white">
            Featured
          </span>
        )}
        <Image
          src={imageUrl}
          alt={title}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute bottom-2 left-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-text-on-primary">
          {formatPrice(price, currency)}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-heading font-semibold text-text-primary line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-text-secondary">
          {region}, {city}
        </p>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          {bedrooms != null && bedrooms > 0 && <span>{bedrooms} beds</span>}
          {bathrooms != null && bathrooms > 0 && <span>{bathrooms} baths</span>}
          {area != null && area > 0 && <span>{area} sqft</span>}
          <span className="capitalize">{propertyType.toLowerCase()}</span>
        </div>
      </div>
    </Link>
  );
}