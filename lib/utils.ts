import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | { toString: () => string }, listingPurpose?: string) {
  const num = typeof price === "object" ? Number(price) : Number(price)
  if (isNaN(num)) return "KES 0"
  const formatted = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(num)
  if (listingPurpose === "FOR_RENT_SHORT_TERM") return `${formatted}/night`
  if (listingPurpose === "FOR_RENT_LONG_TERM") return `${formatted}/month`
  return formatted
}
