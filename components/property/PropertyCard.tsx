/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders";
import { getCoverImage } from "@/lib/images";
import { slugifyCity } from "@/lib/seo";

type PropertyCardVariant = "default" | "compact";

interface PropertyCardProps {
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
  thumbUrl?: string | null;
  isFeatured: boolean;
  urgencyText?: "Trending" | "Just listed" | "Popular";
  isVerified?: boolean;
  priority?: boolean;
  variant?: PropertyCardVariant;
  hasMultipleUnits?: boolean;
  unitMixDescription?: string | null;
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
      <circle cx="9" cy="9" r="9" fill="#1E3A40" />
      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M7 0C4.5 0 2.5 2 2.5 4.5c0 3.4 4.5 9.5 4.5 9.5s4.5-6.1 4.5-9.5C11.5 2 9.5 0 7 0zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
    </svg>
  );
}

export function PropertyCard({
  slug,
  title,
  price,
  propertyType,
  city,
  region,
  bedrooms,
  bathrooms,
  area,
  images,
  coverImage,
  thumbUrl,
  isFeatured: _isFeatured,
  listingPurpose,
  urgencyText,
  isVerified = true,
  priority = false,
  variant = "default",
  hasMultipleUnits = false,
  unitMixDescription = null,
  currency = "KES",
}: PropertyCardProps) {
  const rawImage = getCoverImage({ coverImage, images }) ?? ""
  const imageUrl = thumbUrl && thumbUrl.trim() ? thumbUrl.trim() : (rawImage || PLACEHOLDER_PROPERTY);
  const lcpAttrs = priority ? ({ fetchPriority: "high" } as Record<string, string>) : {};

  const isCompact = variant === "compact";

  const isLand = (propertyType || "").toUpperCase() === "LAND";
  const detailBase = isLand ? "/land" : "/properties";
  const detailHref = `${detailBase}/${slugifyCity(city)}/${slug}`;

  function purposeBadge(purpose: string | null | undefined) {
    if (!purpose) return null
    const bg = purpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-500" : purpose === "FOR_RENT_LONG_TERM" ? "bg-primary-600" : "bg-primary-500"
    const label = purpose === "FOR_RENT_SHORT_TERM" ? "Airbnb" : purpose === "FOR_RENT_LONG_TERM" ? "Rent" : "Sale"
    return (
      <span className={`absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white ${bg}`}>
        {label}
      </span>
    )
  }

  function landBadge() {
    if (!isLand) return null
    return (
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white bg-teal-500">
        Land & Plots
      </span>
    )
  }

  function multiUnitBadge() {
    if (!hasMultipleUnits) return null
    return (
      <span className="absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white bg-purple-500">
        Multiple Units
      </span>
    )
  }

  if (isCompact) {
    return (
      <Link
        href={detailHref}
        className="group flex gap-4 p-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary hover:border-primary-200 hover:shadow-md transition-all duration-200"
      >
        <div className="relative h-24 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-surface-secondary">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={320}
            height={240}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            {...lcpAttrs}
            sizes="128px"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              if (rawImage && img.src !== rawImage && img.src.includes("-thumb.")) { img.src = rawImage; return }
              if (img.src !== PLACEHOLDER_PROPERTY) img.src = PLACEHOLDER_PROPERTY
            }}
          />
          {multiUnitBadge()}
          {purposeBadge(listingPurpose)}
          {landBadge()}
          {urgencyText && (
            <span className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-600 shadow-sm backdrop-blur-sm">
              <FlashIcon />
              {urgencyText}
            </span>
          )}
          {isVerified && (
            <span className="absolute bottom-1.5 right-1.5 z-10">
              <VerifiedIcon />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{title}</h3>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPinIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{region}, {city}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
            {bedrooms != null && bedrooms > 0 && <span>{bedrooms} bed</span>}
            {bathrooms != null && bathrooms > 0 && <span>{bathrooms} bath</span>}
            {area != null && area > 0 && <span>{area.toLocaleString()} sqft</span>}
            <span className="capitalize">{propertyType.toLowerCase()}</span>
          </div>
          {hasMultipleUnits ? (
            <p className="font-heading text-base font-semibold text-primary-600 truncate">{unitMixDescription || "Multiple unit types"}</p>
          ) : (
            <p className="font-heading text-base font-semibold text-primary-600">{formatPrice(price, listingPurpose ?? undefined)}</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg"
    >
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-secondary">
          <div className="absolute inset-0 animate-pulse bg-surface-secondary" aria-hidden="true" />
          <img
            src={imageUrl}
            alt={title}
            className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            width={800}
            height={600}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            {...lcpAttrs}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
            onLoad={(e) => {
              const p = (e.target as HTMLImageElement).previousElementSibling as HTMLElement | null
              if (p) p.style.display = "none"
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement
              const pulse = img.previousElementSibling as HTMLElement | null
              if (pulse) pulse.style.display = "none"
              if (rawImage && img.src !== rawImage && img.src.includes("-thumb.")) { img.src = rawImage; return }
              if (img.src !== PLACEHOLDER_PROPERTY) img.src = PLACEHOLDER_PROPERTY
            }}
          />
          {multiUnitBadge()}
          {purposeBadge(listingPurpose)}
          {landBadge()}
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
          <span className="absolute bottom-2 left-2 z-10 flex max-w-[70%] items-center gap-1 truncate rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm">
            <MapPinIcon className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">
              {region}, {city}
            </span>
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 min-[375px]:p-5">
        {hasMultipleUnits ? (
          <p className="font-heading text-lg font-semibold text-primary-600 truncate">{unitMixDescription || "Multiple unit types"}</p>
        ) : (
          <p className="break-words font-heading text-lg font-extrabold tracking-tight text-text-primary min-[375px]:text-xl">
            {formatPrice(price, listingPurpose ?? undefined)}
          </p>
        )}
        <h3 className="line-clamp-2 min-w-0 break-words font-heading text-base font-semibold leading-tight text-text-primary transition-colors group-hover:text-accent-600 md:text-lg">
          {title}
        </h3>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-secondary py-1.5 text-center text-xs text-text-secondary">
          {bedrooms != null && bedrooms > 0 && (
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Beds</span>
              <span className="font-heading text-sm font-bold text-text-primary">{bedrooms}</span>
            </div>
          )}
          {bathrooms != null && bathrooms > 0 && (
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Baths</span>
              <span className="font-heading text-sm font-bold text-text-primary">{bathrooms}</span>
            </div>
          )}
          {area != null && area > 0 && (
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wide">Area</span>
              <span className="font-heading text-sm font-bold text-text-primary">{area.toLocaleString()} <span className="text-[10px] font-semibold">sqft</span></span>
            </div>
          )}
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wide">Type</span>
            <span className="font-heading text-sm font-bold capitalize text-text-primary">{propertyType.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}