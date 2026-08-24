import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null | undefined | { toString: () => string }, listingPurpose?: string) {
  if (price == null) return "Price on request"
  const num = typeof price === "object" ? Number(price) : Number(price)
  if (isNaN(num)) return "Price on request"
  const formatted = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(num)
  if (listingPurpose === "FOR_RENT_SHORT_TERM") return `${formatted}/night`
  if (listingPurpose === "FOR_RENT_LONG_TERM") return `${formatted}/month`
  return formatted
}

export function fmtKES(value: number | string | null | undefined) {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(Number.isFinite(num) ? num : 0)
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
