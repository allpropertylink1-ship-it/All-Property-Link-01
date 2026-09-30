/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Wrench, Briefcase, BadgeCheck, ArrowUpRight } from "@/components/ui/icons"
import { AVATAR_POOL } from "@/lib/placeholders"
import { optimizeImageUrl } from "@/lib/images"
import { getTradeLabel } from "@/lib/trade-label"

export interface ProfileRow {
  id: string
  title: string
  price: unknown
  currency: string
  city: string | null
  region: string | null
  images: unknown
  userId: string
  categoryId: string
  category: { id: string; name: string; slug?: string } | null
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string | null
    businessLogo?: string | null
    companyName?: string | null
    city?: string | null
  }
}

function hashSeed(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  }
  return h
}

function pickAvatar(seed: string): string {
  const idx = hashSeed(seed) % AVATAR_POOL.length
  return AVATAR_POOL[idx]
}

function getDisplayName(user: ProfileRow["user"]) {
  if (user.companyName) return user.companyName
  return `${user.firstName} ${user.lastName}`
}

function getSubtitle(user: ProfileRow["user"]) {
  if (user.companyName) return `${user.firstName} ${user.lastName}`
  return null
}

function getPhotoUrl(item: ProfileRow): string | null {
  if (item.user.businessLogo) return item.user.businessLogo
  if (item.user.avatar) return item.user.avatar
  const raw = item.images
  if (typeof raw === "string" && raw.trim()) return raw
  if (Array.isArray(raw)) {
    const first = raw.find(
      (u): u is string => typeof u === "string" && u.trim().length > 0
    )
    if (first) return first
  }
  return null
}

export function ProfileCard({
  item,
  variant = "fundi",
}: {
  item: ProfileRow
  variant?: "fundi" | "provider"
}) {
  const photoUrl = getPhotoUrl(item)
  const photoSrc = photoUrl ? optimizeImageUrl(photoUrl, 600) : null
  const fallbackAvatar = pickAvatar(item.id)
  const displayName = getDisplayName(item.user)
  const subtitle = getSubtitle(item.user)
  const location = [item.city, item.user.city].filter(Boolean).join(", ")
  const Icon = variant === "fundi" ? Wrench : Briefcase
  const priceNum = item.price == null ? null : Number(item.price)
  const showPrice = priceNum != null && !Number.isNaN(priceNum) && priceNum > 0
  // No trade pill on fundi cards — the fallback "General Fundi" category only repeats the card content.
  const tradeLabel = variant === "fundi" ? null : getTradeLabel(item.category, item.title)

  return (
    <Link
      href={`/services/${item.id}`}
      aria-label={`View ${displayName}${tradeLabel ? ` — ${tradeLabel}` : ""}`}
      className="group flex flex-1 flex-col items-center rounded-lg border border-border bg-surface px-4 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5"
    >
      {/* Photo with verified badge */}
      <div className="relative mb-3">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 bg-surface-secondary shadow-sm sm:h-24 sm:w-24">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={`${displayName} profile photo`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = fallbackAvatar
              }}
            />
          ) : (
            <img
              src={fallbackAvatar}
              alt={`${displayName} profile photo`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-text-onPrimary" title="Verified">
          <BadgeCheck size={14} aria-hidden="true" />
        </span>
      </div>

      {/* Trade pill (providers only — fundi cards omit it entirely) */}
      {tradeLabel && (
        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
          <Icon size={12} className="shrink-0" aria-hidden="true" />
          <span className="max-w-[140px] truncate">{tradeLabel}</span>
        </span>
      )}

      {/* Name */}
      <h3 className="font-heading text-sm font-bold leading-tight text-text-primary transition-colors group-hover:text-accent-600 sm:text-base">
        {displayName}
      </h3>

      {/* Subtitle (company owner name) */}
      {subtitle && (
        <p className="mt-0.5 max-w-full truncate text-xs text-text-secondary">{subtitle}</p>
      )}

      {/* Location */}
      {location && (
        <p className="mt-1.5 text-xs text-text-secondary">
          <span className="max-w-[150px] truncate">{location}</span>
        </p>
      )}

      {/* Rate */}
      {showPrice && (
        <p className="mt-1.5 text-sm font-bold tabular-nums text-accent-600">
          From KES {priceNum.toLocaleString("en-KE")}
        </p>
      )}

      {/* Profile affordance (non-interactive — whole card is the link) */}
      <span aria-hidden="true" className="min-h-4" />
      <span
        aria-hidden="true"
        className="mt-auto inline-flex min-h-touch w-full items-center justify-center gap-1 rounded-lg bg-surface-secondary px-3 py-2 text-xs font-semibold text-text-primary transition-colors group-hover:bg-primary group-hover:text-text-onPrimary"
      >
        View Profile
        <ArrowUpRight size={13} aria-hidden="true" />
      </span>
    </Link>
  )
}
