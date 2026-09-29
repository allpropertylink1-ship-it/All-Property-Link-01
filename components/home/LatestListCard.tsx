/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useState } from "react"
import { BedDouble, Bath, Maximize2, MapPin, Phone, Mail, ChevronRight } from "@/components/ui/icons"
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
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

  const isLand = (item.propertyType || "").toUpperCase() === "LAND"
  const detailHref = `${isLand ? "/land" : "/properties"}/${slugifyCity(item.city || "kenya")}/${item.slug}`
  const purpose = purposeLabel(item.listingPurpose ?? null)
  const safeActive = Math.min(active, slides.length - 1)
  const callHref = item.agentPhone && item.agentPhone.trim() ? `tel:${item.agentPhone.trim()}` : detailHref

  return (
    <div className="flex flex-col overflow-hidden rounded border border-[#E5E7EB] bg-white font-poppins transition-shadow duration-300 hover:shadow-[0_4px_6px_-1px_rgb(0,0,0/0.1),0_2px_4px_-2px_rgb(0,0,0/0.1)] lg:flex-row lg:border-[1.25px]">
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
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-poppins text-[12px] font-medium text-white">
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
            <ChevronRight size={16} />
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
          <span className="rounded bg-[#F3F4F6] px-3 py-1 font-poppins text-[12px] font-semibold capitalize leading-4 text-[#1F2937]">
            {(item.propertyType || "").toLowerCase()}
          </span>
          {purpose && (
            <span className="rounded bg-[#F97316] px-3 py-1 font-poppins text-[12px] font-semibold leading-4 text-white">
              {purpose}
            </span>
          )}
          {item.listerKind === "OWNER" && (
            <span className="rounded bg-primary px-3 py-1 font-poppins text-[12px] font-semibold leading-4 text-white">
              Owner
            </span>
          )}
          {item.listerKind === "AGENT" && (
            <span className="rounded bg-[#1F2937] px-3 py-1 font-poppins text-[12px] font-semibold leading-4 text-white">
              Agent
            </span>
          )}
        </div>
        {item.price != null && (
          <p className="font-poppins text-[16px] font-bold leading-6 text-primary">
            {formatPrice(item.price, item.listingPurpose ?? undefined)}
          </p>
        )}
        <Link href={detailHref} className="line-clamp-1 font-poppins text-[14px] font-semibold leading-5 text-[#111827] hover:text-primary">
          <h3 className="line-clamp-1 font-poppins text-[14px] font-semibold leading-5">{item.title}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-poppins text-[14px] font-normal leading-5 text-[#4B5569]">
          {item.bedrooms != null && item.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble size={14} aria-hidden="true" />
              {item.bedrooms} {item.bedrooms === 1 ? "Bed" : "Beds"}
            </span>
          )}
          {item.bathrooms != null && item.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath size={14} aria-hidden="true" />
              {item.bathrooms} {item.bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          )}
          {item.area != null && item.area > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={14} aria-hidden="true" />
              {item.area.toLocaleString()} Sqft
            </span>
          )}
        </div>
        <p className="flex items-center gap-1 font-poppins text-[14px] font-normal leading-5 text-[#4B5569]">
          <MapPin size={14} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {item.city}
            {item.region && item.region !== item.city ? ` - ${item.region}` : ""}
          </span>
        </p>
        <div className="mt-1 flex items-center justify-end gap-2">
          <a
            href={callHref}
            aria-label={`Call about ${item.title}`}
            className="inline-flex h-[26px] items-center gap-1 rounded border border-[#B3AED5] bg-white px-3 font-poppins text-[12px] font-medium leading-4 text-[#5A5991] transition-colors hover:bg-[#F3F4F6] lg:border-[1.25px]"
          >
            <Phone size={12} aria-hidden="true" />
            Call
          </a>
          <Link
            href={detailHref}
            aria-label={`Email about ${item.title}`}
            className="inline-flex h-[26px] items-center gap-1 rounded border border-[#B3AED5] bg-white px-3 font-poppins text-[12px] font-medium leading-4 text-[#5A5991] transition-colors hover:bg-[#F3F4F6] lg:border-[1.25px]"
          >
            <Mail size={12} aria-hidden="true" />
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
            <HeartIcon filled={fav} />
          </button>
        </div>
      </div>
    </div>
  )
}
