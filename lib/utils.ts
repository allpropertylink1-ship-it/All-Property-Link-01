import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null | undefined | { toString: () => string }, listingPurpose?: string) {
  if (price == null) return ""
  const num = typeof price === "object" ? Number(price) : Number(price)
  if (isNaN(num)) return ""
  const formatted = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(num)
  if (listingPurpose === "FOR_RENT_SHORT_TERM") return `${formatted}/night`
  if (listingPurpose === "FOR_RENT_LONG_TERM") return `${formatted}/month`
  return formatted
}

export function fmtKES(value: number | string | null | undefined) {
  if (value == null) return "—"
  const num = Number(value)
  if (!Number.isFinite(num)) return "—"
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(num)
}

export interface UnitPriceInput {
  price?: number | string | null | undefined;
  listingPurpose?: string | null;
}

/**
 * Multi-unit price display. Mixed buildings carry sale (millions) and rent
 * (thousands) side by side, so a single "From X" misleads — split by intent:
 * "From KES 35k/mo · From KES 12M sale". Single-intent mixes collapse to one.
 */
export function formatFromPrice(
  units: UnitPriceInput[] | null | undefined,
  fallbackPurpose?: string | null,
): string {
  const priced = (units ?? [])
    .map((u) => ({ price: Number(u.price), purpose: u.listingPurpose ?? fallbackPurpose ?? null }))
    .filter((u) => Number.isFinite(u.price) && u.price > 0) as { price: number; purpose: string | null }[];
  if (priced.length === 0) return "";
  const isRent = (p: string | null) => p === "FOR_RENT_LONG_TERM" || p === "FOR_RENT_SHORT_TERM";
  const rents = priced.filter((u) => isRent(u.purpose));
  const sales = priced.filter((u) => !isRent(u.purpose));
  const parts: string[] = [];
  const minOf = (rows: { price: number; purpose: string | null }[]) => {
    const min = rows.reduce((a, b) => (b.price < a.price ? b : a));
    return `From ${formatPrice(min.price, min.purpose ?? undefined)}`;
  };
  // Sale + rent in one building: show both so neither intent is hidden.
  if (rents.length > 0 && sales.length > 0) {
    parts.push(minOf(rents), minOf(sales));
  } else {
    parts.push(minOf(priced));
  }
  return parts.join(" · ");
}

/** Min/max headline rollup for cards, exports, and SEO ("KES X – Y"). */
export function unitPriceRange(units: UnitPriceInput[] | null | undefined): { min: number | null; max: number | null } {
  const prices = (units ?? [])
    .map((u) => Number(u.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) return { min: null, max: null };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Bedroom span for mixed buildings ("1–3 beds"). Null when no data. */
export function unitBedRange(
  units: { bedrooms?: number | string | null | undefined }[] | null | undefined,
): { min: number; max: number } | null {
  const beds = (units ?? [])
    .map((u) => Number(u.bedrooms))
    .filter((n) => Number.isInteger(n) && n >= 0);
  if (beds.length === 0) return null;
  return { min: Math.min(...beds), max: Math.max(...beds) };
}

/**
 * Privacy-safe reviewer display: "Grace K." - first name + last initial.
 * Used in review cards AND server-rendered JSON-LD authors so they match.
 */
export function formatReviewerName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const f = (firstName || "").trim()
  if (!f) return "Anonymous"
  const l = (lastName || "").trim()
  if (!l) return f
  return `${f} ${l[0].toUpperCase()}.`
}
