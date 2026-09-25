"use client";

import Link from "next/link";
import { resolveImageUrl } from "@/lib/images";
import { PLACEHOLDER_SERVICE } from "@/lib/placeholders";
import { formatPrice } from "@/lib/utils";
import { BadgeCheck, MapPin, MessageCircle, Phone, Star } from "@/components/ui/icons";

interface ServiceCardCompactProps {
  id: string;
  title: string;
  description?: string;
  price: number | string | null;
  currency: string;
  pricePeriod: string;
  city: string | null;
  region: string | null;
  images: unknown;
  category: { name: string; slug: string } | null;
  user: {
    firstName: string;
    lastName: string;
    companyName: string | null;
    businessLogo: string | null;
    phone?: string | null;
    userTypes?: string[] | null;
  } | null;
  phone?: string | null;
  avgRating?: number | null;
  reviewCount?: number | null;
}

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "S";
}

export function ServiceCardCompact({
  id,
  title,
  price,
  pricePeriod,
  city,
  region,
  category,
  user,
  phone: phoneProp,
  avgRating,
  reviewCount,
}: ServiceCardCompactProps) {
  const providerName = user
    ? user.companyName?.trim() ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      "Service provider"
    : "Service provider";
  const logoUrl = resolveImageUrl(user?.businessLogo);
  const area = [city, region].filter(Boolean).join(", ") || "Kenya";

  // Provider type badge
  function providerBadge(userTypes: string[] | null | undefined) {
    if (!userTypes || userTypes.length === 0) return null
    const isFundi = userTypes.includes("FUNDI")
    const isProvider = userTypes.includes("SERVICE_PROVIDER")
    if (isFundi && isProvider) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
          Fundi & Provider
        </span>
      )
    }
    if (isFundi) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
          Fundi
        </span>
      )
    }
    if (isProvider) {
      return (
        <span className="inline-flex items-center rounded-full bg-green/10 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
          Provider
        </span>
      )
    }
    return null
  }

  // Data-driven contact only — never rendered when the listing has no phone.
  const phone = phoneProp ?? user?.phone ?? null;
  const digits = phone ? phone.replace(/\D/g, "") : "";
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${providerName}, I found your listing "${title}" on All Property Link.`)}`
    : null;

  const hasRating = avgRating != null && Number.isFinite(Number(avgRating));

  return (
    <article
      aria-labelledby={`service-card-${id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Craftsman header: avatar + verification tick, name, discipline, rating */}
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-16 w-16 rounded-xl object-cover shadow-sm"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_SERVICE;
              }}
            />
          ) : (
            <div
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 font-heading text-lg font-bold text-primary-600 shadow-sm"
            >
              {user ? initialsOf(user.firstName, user.lastName) : "S"}
            </div>
          )}
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white"
          >
            <BadgeCheck size={13} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              id={`service-card-${id}`}
              className="truncate font-heading text-base font-bold text-text-primary"
            >
              <Link href={`/services/${id}`} className="hover:text-primary-600">
                {providerName}
              </Link>
            </h3>
            {user?.userTypes && providerBadge(user.userTypes)}
            {hasRating && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-secondary px-2 py-0.5">
                <Star size={14} className="fill-accent-500 text-accent-500" />
                <span className="text-sm font-bold text-text-primary">
                  {Number(avgRating).toFixed(1)}
                </span>
                {reviewCount != null && (
                  <span className="text-xs text-text-secondary">({reviewCount})</span>
                )}
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-text-secondary">{title}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{area}</span>
          </p>
        </div>
      </div>

      {/* Pricing strip */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-secondary p-2.5">
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
            {category ? category.name : "Service rate"}
          </span>
          <span className="truncate font-heading text-base font-bold text-text-primary">
            {price != null
              ? `${formatPrice(Number(price))}${
                  pricePeriod && pricePeriod !== "TOTAL"
                    ? `/${pricePeriod.toLowerCase().replace("per_", "")}`
                    : ""
                }`
              : "Price on request"}
          </span>
        </div>
        {category && (
          <Link
            href={`/services?category=${category.slug}`}
            className="shrink-0 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            {category.name}
          </Link>
        )}
      </div>

      {/* Dual contact actions — data-driven only */}
      {phone && waHref ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-touch items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <Phone size={16} className="text-primary-600" />
            Call
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch items-center justify-center gap-1.5 rounded-lg bg-whatsapp px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-whatsapp-dark"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      ) : (
        <Link
          href={`/services/${id}`}
          className="inline-flex min-h-touch items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
        >
          View details
        </Link>
      )}
    </article>
  );
}
