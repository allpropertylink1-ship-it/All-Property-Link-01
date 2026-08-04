"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Search } from "@/components/ui/icons"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders"

const ROTATION_DAYS = 2
const DAY_MS = 24 * 60 * 60 * 1000

interface Slide {
  slug: string
  title: string
  price: number | null
  city: string
  listingPurpose: string | null
  image: string
}

interface ApiProperty {
  slug: string
  title: string
  price: number | string | null
  city: string
  listingPurpose: string | null
  images: unknown
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4L6.5 10l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3.5 11.5l8-8M5 3.5h5.5V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function toSlides(rows: ApiProperty[]): Slide[] {
  const slides: Slide[] = []
  for (const p of rows) {
    const imgs = Array.isArray(p.images)
      ? p.images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : []
    if (imgs.length === 0) continue
    slides.push({
      slug: p.slug,
      title: p.title,
      price: p.price == null ? null : Number(p.price),
      city: p.city ?? "",
      listingPurpose: p.listingPurpose,
      image: imgs[0],
    })
  }
  return slides
}

export function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const purposes = ["FOR_RENT_SHORT_TERM", "FOR_SALE", "FOR_RENT_LONG_TERM"]
    Promise.all(
      purposes.map((p) =>
        fetch(`/api/properties?purpose=${p}&limit=4`)
          .then((r) => (r.ok ? r.json() : { properties: [] }))
          .catch(() => ({ properties: [] }))
      )
    )
      .then((results) => {
        const seen = new Set<string>()
        const all: Slide[] = []
        for (const res of results) {
          for (const p of res.properties || []) {
            if (seen.has(p.slug)) continue
            seen.add(p.slug)
            const slides = toSlides([p])
            if (slides.length === 0) continue
            all.push(slides[0])
            if (all.length === 8) break
          }
          if (all.length === 8) break
        }
        setSlides(all)
        if (all.length > 0) {
          setActive(Math.floor(Date.now() / (ROTATION_DAYS * DAY_MS)) % all.length)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const go = (dir: number) =>
    setActive((a) => (a + dir + slides.length) % slides.length)

  const slide = slides.length > 0 ? slides[active] : null

  return (
    <section className="relative flex min-h-[560px] flex-col overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent pb-16 pt-16 sm:min-h-[620px] sm:pb-20 sm:pt-20">
      {/* Featured listing image fills the hero as its background */}
      {slide && (
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt={`${slide.title} in ${slide.city}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = PLACEHOLDER_PROPERTY
            }}
          />
          {/* Overlay to keep text and controls readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-black/45 to-black/75" />
        </div>
      )}
      {!slide && (
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      )}
      <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5 blur-3xl" />
      <div className="container relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-teal-300" />
          Kenya&apos;s Trusted Property Marketplace
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
          Find Your Perfect
          <span className="block text-teal-200">Property in Kenya</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:text-lg">
          Browse thousands of properties for sale, rent, and short-term stays across Kenya.
          Connect directly with verified agents and property owners.
        </p>
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/20 bg-black/25 p-1.5 backdrop-blur-md">
          <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
            <Search size={18} className="text-white/60" />
            <input
              type="text"
              placeholder="Search by location, property type..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>
          <Link
            href="/browse"
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-teal-50"
          >
            Search
          </Link>
        </div>

        {/* Featured listing caption card — rotates every 2 days */}
        {!loaded && (
          <div className="mx-auto mt-10 w-full max-w-4xl animate-pulse rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="h-3 w-28 rounded bg-white/25" />
            <div className="mt-3 h-5 w-2/3 rounded bg-white/25" />
            <div className="mt-2 h-4 w-32 rounded bg-white/25" />
          </div>
        )}
        {loaded && slide && (
          <div className="mx-auto mt-10 w-full max-w-4xl rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/properties/${(slide.city || "kenya").toLowerCase()}/${slide.slug}`}
                className="group min-w-0 flex-1 text-left"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  Featured listing
                </p>
                <h2 className="mt-1 truncate font-heading text-base font-bold leading-tight text-white sm:text-lg">
                  {slide.title}
                </h2>
                <p className="mt-0.5 font-heading text-sm font-bold text-accent-300 sm:text-base">
                  {formatPrice(slide.price, slide.listingPurpose ?? undefined)}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/properties/${(slide.city || "kenya").toLowerCase()}/${slide.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-teal-50"
                >
                  View Listing
                  <ArrowUpRight />
                </Link>
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous listing"
                      onClick={() => go(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      type="button"
                      aria-label="Next listing"
                      onClick={() => go(1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>
            </div>
            {slides.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    aria-label={`Go to listing ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
