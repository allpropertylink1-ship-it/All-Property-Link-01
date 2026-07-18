import Link from "next/link";
import Image from "next/image";

interface PropertyCardProps {
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
  urgencyText?: "Trending" | "Just listed" | "Popular";
  isVerified?: boolean;
  priority?: boolean;
}

function FlashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M5.7 0L2 7h2.8l-.7 5L9 4.5H6.2L7.5 0H5.7z" fill="currentColor" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#286255" />
      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 0C4.5 0 2.5 2 2.5 4.5c0 3.4 4.5 9.5 4.5 9.5s4.5-6.1 4.5-9.5C11.5 2 9.5 0 7 0zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
    </svg>
  );
}

function formatPrice(price: number, currency: string, listingPurpose?: string | null) {
  const formatted = `${currency} ${Number(price).toLocaleString()}`;
  if (listingPurpose === "FOR_RENT_SHORT_TERM") return `${formatted}/night`;
  if (listingPurpose === "FOR_RENT_LONG_TERM") return `${formatted}/month`;
  return formatted;
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
  isFeatured: _isFeatured,
  listingPurpose,
  urgencyText,
  isVerified = true,
  priority,
}: PropertyCardProps) {
  const imageUrls = Array.isArray(images) ? images : [];
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : "/placeholder.svg";

  return (
    <Link
      href={`/properties/${city.toLowerCase()}/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 md:flex-row md:hover:-translate-y-[3px] md:hover:shadow-lg"
    >
      <div className="relative w-full overflow-hidden md:w-[28%] md:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden md:h-full">
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
          <span
            className={`absolute left-2 top-2 z-10 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${
              listingPurpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-400" : listingPurpose === "FOR_RENT_LONG_TERM" ? "bg-primary-600" : "bg-primary-500"
            }`}
          >
            {listingPurpose === "FOR_RENT_SHORT_TERM" ? "Airbnb" : listingPurpose === "FOR_RENT_LONG_TERM" ? "Rent" : "Sale"}
          </span>
          {urgencyText && (
            <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-600 shadow-sm backdrop-blur-sm">
              <FlashIcon />
              {urgencyText}
            </span>
          )}
          {isVerified && (
            <span className="absolute bottom-2 right-2 z-10">
              <VerifiedIcon />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 p-4 md:p-5">
        <h3 className="font-heading text-base font-semibold leading-tight text-text-primary md:text-lg">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-text-secondary md:text-sm">
          <MapPinIcon />
          <span>
            {region}, {city}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          {bedrooms != null && bedrooms > 0 && <span>{bedrooms} beds</span>}
          {bathrooms != null && bathrooms > 0 && <span>{bathrooms} baths</span>}
          {area != null && area > 0 && <span>{area} sqft</span>}
          <span className="capitalize">{propertyType.toLowerCase()}</span>
        </div>
        <p className="mt-1.5 font-heading text-xl font-semibold text-accent-400">
          {formatPrice(price, currency, listingPurpose)}
        </p>
      </div>
    </Link>
  );
}