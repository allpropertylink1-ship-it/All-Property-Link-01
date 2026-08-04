import Link from "next/link"
import { MapPin, Wrench, Briefcase } from "@/components/ui/icons"
import { PLACEHOLDER_SERVICE } from "@/lib/placeholders"

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

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
  const images = Array.isArray(item.images) ? item.images : []
  if (typeof item.images === "string" && item.images) return item.images
  if (images.length > 0) return String(images[0])
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
  const initials = getInitials(item.user.firstName, item.user.lastName)
  const displayName = getDisplayName(item.user)
  const subtitle = getSubtitle(item.user)
  const location = [item.city, item.user.city].filter(Boolean).join(", ")
  const Icon = variant === "fundi" ? Wrench : Briefcase

  return (
    <Link
      href={`/services/${item.id}`}
      className="group relative flex flex-col items-center rounded-2xl border border-border bg-surface px-4 py-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:px-6 sm:py-8"
    >
      {/* Photo */}
      <div className="relative mb-4">
        <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-accent-300 bg-surface-secondary shadow-sm transition-shadow duration-300 group-hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_SERVICE
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent-50">
              <span className="text-2xl font-bold text-accent-400 sm:text-3xl">
                {initials}
              </span>
            </div>
          )}
        </div>
        {/* Online-style accent dot */}
        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface bg-primary-400 sm:h-5 sm:w-5" />
      </div>

      {/* Name */}
      <h3 className="font-heading text-sm font-bold leading-tight text-text-primary sm:text-base">
        {displayName}
      </h3>

      {/* Subtitle (company owner name) */}
      {subtitle && (
        <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>
      )}

      {/* Category pill */}
      {item.category && (
        <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-[11px] font-semibold text-accent-600 sm:text-xs">
          <Icon size={12} className="shrink-0" />
          {item.category.name}
        </span>
      )}

      {/* Location */}
      {location && (
        <div className="mt-2.5 flex items-center gap-1 text-xs text-text-secondary">
          <MapPin size={12} className="shrink-0 text-accent-400" />
          <span className="truncate max-w-[140px]">{location}</span>
        </div>
      )}
    </Link>
  )
}
