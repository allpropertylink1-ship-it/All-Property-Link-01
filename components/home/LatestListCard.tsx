/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useState } from "react"
import {
  IconBed,
  IconBath,
  IconRuler,
  IconMapPin,
  IconPhone,
  IconMail,
  IconChevronRight,
  IconHeart,
} from "@tabler/icons-react"
import { formatPrice } from "@/lib/utils"
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

/**
 * PurpleRoof-geometry list card: horizontal (image left + details right) on
 * desktop, vertical (image top) on mobile rails. Cover photo first, arrow +
 * dots + counter carousel, KES-only price, no agent row.
 */
export function LatestListCard({ item, priority = false }: { item: LatestListCardData; priority?: boolean }) {
  const gallery = getGalleryImages({ coverImage: item.coverImage, images: item.images }).slice(0, 5)
  const cover = getCoverImage({ coverImage: item.coverImage, images: item.images })
  const slides = (gallery.length > 0 ? gallery : cover ? [cover] : [PLACEHOLDER_PROPERTY]).slice(0, 5)
  const [active, setActive] = useState(0)
  const [fav, setFav] = useState(false)

  const propertyKind = (item.propertyType || "").toUpperCase()
  const isLand = propertyKind === "LAND"
  // Beds/baths only make sense for living spaces — hidden for LAND/COMMERCIAL.
  const isNonLiving = propertyKind === "LAND" || propertyKind === "COMMERCIAL"
  const hasBeds = item.bedrooms != null && item.bedrooms > 0
  const hasBaths = item.bathrooms != null && item.bathrooms > 0
  const hasArea = item.area != null && item.area > 0
  const detailHref = `${isLand ? "/land" : "/properties"}/${slugifyCity(item.city || "kenya")}/${item.slug}`
  const purpose = purposeLabel(item.listingPurpose ?? null)
  const safeActive = Math.min(active, slides.length - 1)
  const callHref = item.agentPhone && item.agentPhone.trim() ? `tel:${item.agentPhone.trim()}` : detailHref

  return (
    <div className="flex flex-col overflow-hidden rounded border border-[#E5E7EB] bg-white font-body transition-shadow duration-300 hover:shadow-[0_4px_6px_-1px_rgb(0,0,0/0.1),0_2px_4px_-2px_rgb(0,0,0/0.1)] lg:flex-row lg:border-[1.25px]">
      {/* Image carousel */}
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-[#F3F4F6] lg:h-[240px] lg:w-[240px]">
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
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              i === safeActive ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Counter */}
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-body text-[12px] font-medium text-white">
          {safeActive + 1} / {slides.length}
        </span>
        {/* Next arrow */}
        {slides.length > 1 && (
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setActive((a) => (a + 1) % slides.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#374151] transition-colors hover:bg-white"
          >
            <IconChevronRight size={16} stroke={1.5} aria-hidden="true" />
          </button>
        )}
        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5" role="group" aria-label="Choose image">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === safeActive ? "true" : undefined}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === safeActive ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-[#F3F4F6] px-3 py-1 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-[#1F2937]">
            {item.propertyType || ""}
          </span>
          {purpose && (
            <span className="rounded bg-[#F97316] px-3 py-1 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-white">
              {purpose}
            </span>
          )}
          {item.listerKind === "OWNER" && (
            <span className="rounded bg-primary px-3 py-1 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-white">
              Owner
            </span>
          )}
          {item.listerKind === "AGENT" && (
            <span className="rounded bg-[#1F2937] px-3 py-1 font-body text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-white">
              Agent
            </span>
          )}
        </div>
        {item.price != null && (
          <p className="font-body text-[16px] font-bold leading-6 text-primary">
            {formatPrice(item.price, item.listingPurpose ?? undefined)}
          </p>
        )}
        <Link href={detailHref} className="line-clamp-1 font-body text-[14px] font-semibold leading-5 text-[#111827] hover:text-primary">
          <h3 className="line-clamp-1 font-body text-[14px] font-semibold leading-5">{item.title}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[14px] font-normal leading-5 tabular-nums text-[#4B5569]">
          {!isNonLiving && (
            <span
              className="inline-flex items-center gap-1.5"
              aria-label={hasBeds ? `${item.bedrooms} bedrooms` : "Bedrooms not specified"}
            >
              <IconBed size={16} stroke={1.5} aria-hidden="true" />
              {hasBeds ? (
                <>{item.bedrooms} {item.bedrooms === 1 ? "Bed" : "Beds"}</>
              ) : (
                <span className="tracking-[0.2em] text-[#9CA3AF]">_ Beds</span>
              )}
            </span>
          )}
          {!isNonLiving && (
            <span
              className="inline-flex items-center gap-1.5"
              aria-label={hasBaths ? `${item.bathrooms} bathrooms` : "Bathrooms not specified"}
            >
              <IconBath size={16} stroke={1.5} aria-hidden="true" />
              {hasBaths ? (
                <>{item.bathrooms} {item.bathrooms === 1 ? "Bath" : "Baths"}</>
              ) : (
                <span className="tracking-[0.2em] text-[#9CA3AF]">_ Baths</span>
              )}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5"
            aria-label={hasArea ? `${item.area?.toLocaleString()} square feet` : "Size not specified"}
          >
            <IconRuler size={16} stroke={1.5} aria-hidden="true" />
            {hasArea ? (
              <>{item.area?.toLocaleString()} Sqft</>
            ) : (
              <span className="tracking-[0.2em] text-[#9CA3AF]">___ Sqft</span>
            )}
          </span>
        </div>
        <p className="flex items-center gap-1.5 font-body text-[14px] font-normal leading-5 text-[#4B5569]">
          <IconMapPin size={16} stroke={1.5} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {item.city}
            {item.region && item.region !== item.city ? ` - ${item.region}` : ""}
          </span>
        </p>
        <div className="mt-1 flex items-center justify-end gap-2">
          <a
            href={callHref}
            aria-label={`Call about ${item.title}`}
            className="inline-flex h-[26px] items-center gap-1 rounded border border-[#B3AED5] bg-white px-3 font-body text-[12px] font-medium leading-4 text-[#5A5991] transition-colors hover:bg-[#F3F4F6] lg:border-[1.25px]"
          >
            <IconPhone size={12} stroke={1.5} aria-hidden="true" />
            Call
          </a>
          <Link
            href={detailHref}
            aria-label={`Email about ${item.title}`}
            className="inline-flex h-[26px] items-center gap-1 rounded border border-[#B3AED5] bg-white px-3 font-body text-[12px] font-medium leading-4 text-[#5A5991] transition-colors hover:bg-[#F3F4F6] lg:border-[1.25px]"
          >
            <IconMail size={12} stroke={1.5} aria-hidden="true" />
            Email
          </Link>
          <button
            type="button"
            aria-label="Add to favorites"
            aria-pressed={fav}
            onClick={() => setFav((f) => !f)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              fav ? "text-rose-600" : "text-[#9CA3AF] hover:text-rose-500"
            }`}
          >
            <IconHeart size={18} stroke={1.5} aria-hidden="true" fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  )
}
