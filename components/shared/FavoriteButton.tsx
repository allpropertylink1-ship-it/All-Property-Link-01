"use client"

import { IconHeart } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useFavorites, type FavoriteType } from "@/lib/favorites-context"

interface FavoriteButtonProps {
  type: FavoriteType
  refId: string
  label: string
  /** Position the button absolutely inside a card image (caller handles position). */
  className?: string
  /** Circle style used on card images. */
  variant?: "circle" | "plain"
  size?: number
}

/**
 * Shared save-to-favorites heart. Bakes in the click-capture guard: cards
 * wrap content in a stretched <Link>, so clicks must stopPropagation +
 * preventDefault or they navigate instead of toggling.
 */
export function FavoriteButton({ type, refId, label, className, variant = "circle", size = 20 }: FavoriteButtonProps) {
  const { isSaved, toggle } = useFavorites()
  const fav = isSaved(type, refId)

  return (
    <button
      type="button"
      aria-label={fav ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      aria-pressed={fav}
      title={fav ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggle(type, refId)
      }}
      className={cn(
        "relative z-20 inline-flex shrink-0 items-center justify-center transition-colors motion-reduce:transition-none",
        variant === "circle" ? "h-9 w-9 rounded-full bg-white/90 shadow-sm backdrop-blur-sm" : "rounded hover:bg-surface-secondary",
        fav ? "text-error" : "text-text-secondary hover:text-error",
        className,
      )}
    >
      <IconHeart size={size} stroke={1.5} aria-hidden="true" fill={fav ? "currentColor" : "none"} />
    </button>
  )
}