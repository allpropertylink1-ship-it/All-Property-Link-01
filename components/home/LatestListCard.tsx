/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  IconBed,
  IconBath,
  IconRuler,
  IconMapPin,
  IconPhone,
  IconChevronRight,
  IconChevronLeft,
  IconHeart,
} from "@tabler/icons-react"
import { cn, formatPrice } from "@/lib/utils"
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders"
import { getCoverImage, getGalleryImages, optimizeImageUrl } from "@/lib/images"
import { slugifyCity } from "@/lib/seo"

export interface LatestListCardData {
  slug: string
  title: string
  price: number | null
  propertyType: string
  listingPurpose?: string | null
  city: string
  region?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  plotSize?: number | string | null
  plotSizeUnit?: string | null
  images: unknown
  coverImage?: string | null
  agentPhone?: string | null
  listerKind?: "OWNER" | "AGENT" | null
}

function purposeLabel(purpose: string | null | undefined): string | null {
  if (!purpose) return null
  if (purpose === "FOR_RENT_SHORT_TERM") return "Airbnb"
  if (purpose === "FOR_RENT_LONG_TERM") return "Long Term Rent"
  return "Sale"
}

const FAV_KEY = "apl-favs"

function readFavSlugs(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [])
  } catch {
    return new Set()
  }
}

/**
 * PurpleRoof-geometry list card: horizontal (image left + details right) on
 * desktop, vertical (image top) on mobile rails. Cover photo first, arrows +
 * dots + counter carousel, KES-only price, no agent row.
 */
export function LatestListCard({ item, priority = false }: { item: LatestListCardData; priority?: boolean }) {
  const gallery = getGalleryImages({ coverImage: item.coverImage, images: item.images }).slice(0, 5)
  const cover = getCoverImage({ coverImage: item.coverImage, images: item.images })
  const slides = (gallery.length > 0 ? gallery : cover ? [cover] : [PLACEHOLDER_PROPERTY]).slice(0, 5)
  const [active, setActive] = useState(0)
  const [fav, setFav] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const propertyKind = (item.propertyType || "").toUpperCase()
  const isLand = propertyKind === "LAND"
  // Beds/baths only make sense for living spaces — hidden for LAND/COMMERCIAL.
  const isNonLiving = propertyKind === "LAND" || propertyKind === "COMMERCIAL"
  const hasBeds = item.bedrooms != null && item.bedrooms > 0
  const hasBaths = item.bathrooms != null && item.bathrooms > 0
  const hasArea = item.area != null && item.area > 0
  const plotSizeText = item.plotSize != null && String(item.plotSize).trim() !== "" ? String(item.plotSize).trim() : null
  const plotLabel = plotSizeText
    ? item.plotSizeUnit && item.plotSizeUnit.trim() !== ""
      ? `${plotSizeText} ${item.plotSizeUnit.trim()}`
      : plotSizeText
    : null
  const showSpecs =
    (!isNonLiving && (hasBeds || hasBaths)) || (!isLand && hasArea) || (isLand && plotLabel != null)
  const detailHref = `${isLand ? "/land" : "/properties"}/${slugifyCity(item.city || "kenya")}/${item.slug}`
  const purpose = purposeLabel(item.listingPurpose ?? null)
  const safeActive = Math.min(active, slides.length - 1)
  const phone = item.agentPhone?.trim() ? item.agentPhone.trim() : null

  useEffect(() => {
    setFav(readFavSlugs().has(item.slug))
  }, [item.slug])

  function toggleFav() {
    setFav((prev) => {
      const next = !prev
      try {
        const slugs = readFavSlugs()
        if (next) slugs.add(item.slug)
        else slugs.delete(item.slug)
        localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(slugs)))
      } catch {
        // Storage unavailable (private mode) — keep in-memory state only.
      }
      return next
    })
  }

  function goNext() {
    setActive((a) => (a + 1) % slides.length)
  }

  function goPrev() {
    setActive((a) => (a - 1 + slides.length) % slides.length)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded border border-border bg-surface font-body transition-shadow duration-300 hover:shadow-md lg:flex-row">
      {/* Image carousel */}
      <div
        className="relative h-[200px] w-full shrink-0 overflow-hidden bg-surface-secondary lg:h-[240px] lg:w-[240px]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
          const dx = endX - touchStartX.current
          touchStartX.current = null
          if (dx <= -40) goNext()
          else if (dx >= 40) goPrev()
        }}
      >
        {slides.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={optimizeImageUrl(src, 720)}
            alt={i === safeActive ? `${item.title} - Image ${i + 1}` : ""}
            aria-hidden={i === safeActive ? undefined : "true"}
            loading={priority && i === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              if ((e.target as HTMLImageElement).src !== PLACEHOLDER_PROPERTY) {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_PROPERTY
              }
            }}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none",
              i === safeActive ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Counter */}
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-body text-[12px] font-medium text-white">
          {safeActive + 1} / {slides.length}
        </span>
        {/* Prev / Next arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-secondary transition-colors hover:bg-surface"
            >
              <IconChevronLeft size={16} stroke={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text-secondary transition-colors hover:bg-surface"
            >
              <IconChevronRight size={16} stroke={1.5} aria-hidden="true" />
            </button>
          </>
        )}
        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1" role="group" aria-label="Choose image">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === safeActive ? "true" : undefined}
                onClick={() => setActive(i)}
                className="flex min-h-[24px] min-w-[24px] items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 rounded-full transition-all motion-reduce:transition-none",
                    i === safeActive ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-surface-secondary px-3 py-1 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-text-primary">
            {item.propertyType || ""}
          </span>
        </div>
        <h3 className="line-clamp-2 text-balance font-body text-[15px] font-semibold leading-6 text-text-primary sm:text-base">
          <Link href={detailHref} className="transition-colors hover:text-primary">
            {item.title}
          </Link>
        </h3>
        {item.price != null && (
          <p className="font-body text-base font-bold leading-6 tabular-nums text-primary">
            {formatPrice(item.price, item.listingPurpose ?? undefined)}
          </p>
        )}
        {showSpecs && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[14px] font-normal leading-5 tabular-nums text-text-secondary">
            {!isNonLiving && hasBeds && (
              <span className="inline-flex items-center gap-1.5" aria-label={`${item.bedrooms} bedrooms`}>
                <IconBed size={16} stroke={1.5} aria-hidden="true" />
                {item.bedrooms} {item.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            )}
            {!isNonLiving && hasBaths && (
              <span className="inline-flex items-center gap-1.5" aria-label={`${item.bathrooms} bathrooms`}>
                <IconBath size={16} stroke={1.5} aria-hidden="true" />
                {item.bathrooms} {item.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            )}
            {isLand ? (
              plotLabel != null && (
                <span className="inline-flex items-center gap-1.5" aria-label={`Plot size ${plotLabel}`}>
                  <IconRuler size={16} stroke={1.5} aria-hidden="true" />
                  {plotLabel}
                </span>
              )
            ) : (
              hasArea && (
                <span
                  className="inline-flex items-center gap-1.5"
                  aria-label={`${item.area?.toLocaleString()} square feet`}
                >
                  <IconRuler size={16} stroke={1.5} aria-hidden="true" />
                  {item.area?.toLocaleString()} Sqft
                </span>
              )
            )}
          </div>
        )}
        <p className="flex items-center gap-1.5 font-body text-[14px] font-normal leading-5 text-text-secondary">
          <IconMapPin size={16} stroke={1.5} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {item.city}
            {item.region && item.region !== item.city ? ` - ${item.region}` : ""}
          </span>
        </p>
        {item.listerKind && (
          <p className="sr-only">
            Listed by {item.listerKind === "OWNER" ? "Owner" : "Agent"}
          </p>
        )}
        <div className="mt-auto flex min-h-touch flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {purpose && (
              <span className="inline-flex min-h-touch items-center justify-center gap-1.5 rounded border border-transparent bg-accent-500 px-3 font-body text-[12px] font-medium leading-4 text-white">
                {purpose}
              </span>
            )}
            {item.listerKind === "OWNER" && (
              <span className="inline-flex min-h-touch items-center justify-center gap-1.5 rounded border border-transparent bg-primary px-3 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-white">
                Owner
              </span>
            )}
            {item.listerKind === "AGENT" && (
              <span className="inline-flex min-h-touch items-center justify-center gap-1.5 rounded border border-border bg-surface-secondary px-3 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-text-primary">
                Agent
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label={`Call about ${item.title}`}
              className="inline-flex min-h-touch min-w-touch items-center justify-center gap-1.5 rounded border border-border bg-surface px-3 font-body text-[12px] font-medium leading-4 text-primary transition-colors hover:bg-surface-secondary"
            >
              <IconPhone size={12} stroke={1.5} aria-hidden="true" />
              Call
            </a>
          )}
          <Link
            href={detailHref}
            aria-label={`View details about ${item.title}`}
            className="inline-flex min-h-touch min-w-touch items-center justify-center gap-1.5 rounded border border-border bg-surface px-3 font-body text-[12px] font-medium leading-4 text-primary transition-colors hover:bg-surface-secondary"
          >
            <IconChevronRight size={12} stroke={1.5} aria-hidden="true" />
            Details
          </Link>
          <button
            type="button"
            aria-label={fav ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
            aria-pressed={fav}
            onClick={toggleFav}
            className={cn(
              "flex min-h-touch min-w-touch items-center justify-center rounded-full transition-colors motion-reduce:transition-none",
              fav ? "text-error" : "text-text-secondary hover:text-error"
            )}
          >
            <IconHeart size={18} stroke={1.5} aria-hidden="true" fill={fav ? "currentColor" : "none"} />
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}
