/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Search } from "@/components/ui/icons"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders"
import { optimizeImageUrl } from "@/lib/images"

const DAY_MS = 24 * 60 * 60 * 1000
const AUTO_INTERVAL_MS = 6000

type PersonaId = "buy" | "rent" | "stay" | "list"

interface Persona {
  id: PersonaId
  label: string
  headlineTop: string
  headlineAccent: string
  accentClass: string
  subtitle: string
  placeholder: string
  purpose: string | null
  featuredLabel: string
}

const PERSONAS: Persona[] = [
  {
    id: "buy",
    label: "Buy",
    headlineTop: "Find Your Perfect",
    headlineAccent: "Property in Kenya",
    accentClass: "text-teal-200",
    subtitle:
      "Browse thousands of properties for sale across Kenya. Connect directly with verified agents and property owners.",
    placeholder: "City, estate, or property type...",
    purpose: "FOR_SALE",
    featuredLabel: "Featured for sale",
  },
  {
    id: "rent",
    label: "Rent",
    headlineTop: "Rent a Home",
    headlineAccent: "That Feels Like Yours",
    accentClass: "text-teal-200",
    subtitle:
      "Long-term rentals in neighbourhoods you'll love. Verified listings, real owners, no middlemen.",
    placeholder: "Which town or estate?",
    purpose: "FOR_RENT_LONG_TERM",
    featuredLabel: "Featured rentals",
  },
  {
    id: "stay",
    label: "Book a Short Stay",
    headlineTop: "Weekend Away?",
    headlineAccent: "Find a Short Stay",
    accentClass: "text-amber-200",
    subtitle:
      "Stays in Diani, Naivasha, Nyahururu and beyond. Book by the night from verified hosts and agents.",
    placeholder: "Beach town or getaway spot...",
    purpose: "FOR_RENT_SHORT_TERM",
    featuredLabel: "Featured stays",
  },
  {
    id: "list",
    label: "List",
    headlineTop: "List Your Property",
    headlineAccent: "Direct to Verified Buyers",
    accentClass: "text-accent-200",
    subtitle:
      "Owners and agents list for free. Your listing is verified by an APL representative before it goes live.",
    placeholder: "",
    purpose: null,
    featuredLabel: "",
  },
]

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

interface TickerItem {
  slug: string
  title: string
  price: number | null
  city: string
  listingPurpose: string | null
}

export function HeroSection() {
  const router = useRouter()
  const [persona, setPersona] = useState<Persona>(PERSONAS[0])
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ticker, setTicker] = useState<TickerItem[]>([])
  const [tickerOffset, setTickerOffset] = useState(0)
  const [gliding, setGliding] = useState(false)
  const [query, setQuery] = useState("")
  const cacheRef = useRef<Map<string, Slide[]>>(new Map())
  const tickerTrackRef = useRef<HTMLDivElement>(null)
  const tickerRegionRef = useRef<HTMLDivElement>(null)
  const tickerOffsetRef = useRef(0)
  const tickerLastRef = useRef(0)
  const tickerRAF = useRef<number | null>(null)
  const tickerTimer = useRef<number | null>(null)

  const loadSlides = (purpose: string | null) => {
    if (!purpose) {
      setSlides([])
      setLoaded(true)
      return
    }
    const cached = cacheRef.current.get(purpose)
    if (cached) {
      setSlides(cached)
      setActive(Math.floor(Date.now() / (DAY_MS * 2)) % cached.length)
      setLoaded(true)
      return
    }
    setLoaded(false)
    fetch(`/api/properties?purpose=${purpose}&limit=8`)
      .then((r) => (r.ok ? r.json() : { properties: [] }))
      .catch(() => ({ properties: [] }))
      .then((res) => {
        const next = toSlides(res.properties || []).slice(0, 8)
        cacheRef.current.set(purpose, next)
        setSlides(next)
        if (next.length > 0) {
          setActive(Math.floor(Date.now() / (DAY_MS * 2)) % next.length)
        }
        setLoaded(true)
      })
  }

  useEffect(() => {
    loadSlides(PERSONAS[0].purpose)
    fetch("/api/properties?limit=12")
      .then((r) => (r.ok ? r.json() : { properties: [] }))
      .catch(() => ({ properties: [] }))
      .then((res) => {
        const seen = new Set<string>()
        const items: TickerItem[] = []
        for (const p of res.properties || []) {
          if (seen.has(p.slug)) continue
          seen.add(p.slug)
          items.push({
            slug: p.slug,
            title: p.title,
            price: p.price == null ? null : Number(p.price),
            city: p.city ?? "",
            listingPurpose: p.listingPurpose,
          })
          if (items.length === 10) break
        }
        setTicker(items)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopTicker = () => {
    if (tickerRAF.current !== null) {
      cancelAnimationFrame(tickerRAF.current)
      tickerRAF.current = null
    }
  }

  const startTicker = () => {
    if (ticker.length < 2) return
    stopTicker()
    tickerLastRef.current = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - tickerLastRef.current) / 1000)
      tickerLastRef.current = t
      const track = tickerTrackRef.current
      if (track) {
        const half = track.scrollWidth / 2
        if (half > 0) {
          const speed = half / 120
          tickerOffsetRef.current -= dt * speed
          while (tickerOffsetRef.current <= -half) tickerOffsetRef.current += half
          while (tickerOffsetRef.current > 0) tickerOffsetRef.current -= half
        }
      }
      setTickerOffset(Math.round(tickerOffsetRef.current))
      tickerRAF.current = requestAnimationFrame(tick)
    }
    tickerRAF.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (ticker.length >= 2) startTicker()
    return () => {
      stopTicker()
      if (tickerTimer.current !== null) clearTimeout(tickerTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker.length])

  // When an item is hovered, freeze the strip and glide it so the whole
  // label is inside the visible region (no clipping at either edge).
  const handleTickerItemEnter = (el: HTMLAnchorElement) => {
    stopTicker()
    const region = tickerRegionRef.current
    if (!region) return
    const rr = region.getBoundingClientRect()
    const ir = el.getBoundingClientRect()
    const pad = 28
    let delta = 0
    if (ir.left < rr.left) delta = rr.left - ir.left + pad
    else if (ir.right > rr.right) delta = rr.right - ir.right - pad
    if (delta === 0) return
    const target = tickerOffsetRef.current + delta
    tickerOffsetRef.current = target
    setGliding(true)
    setTickerOffset(target)
  }

  const handleTickerEnter = () => {
    if (tickerTimer.current !== null) {
      clearTimeout(tickerTimer.current)
      tickerTimer.current = null
    }
    stopTicker()
  }

  const handleTickerLeave = () => {
    if (gliding) {
      if (tickerTimer.current !== null) clearTimeout(tickerTimer.current)
      tickerTimer.current = window.setTimeout(() => {
        tickerTimer.current = null
        setGliding(false)
        startTicker()
      }, 700)
    } else {
      startTicker()
    }
  }

  const switchPersona = (next: Persona) => {
    setPersona(next)
    setActive(0)
    loadSlides(next.purpose)
  }

  useEffect(() => {
    if (slides.length < 2 || paused) return
    const t = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      AUTO_INTERVAL_MS
    )
    return () => clearInterval(t)
  }, [slides.length, paused])

  const go = (dir: number) =>
    setActive((a) => (a + dir + slides.length) % slides.length)

  const slide = slides.length > 0 ? slides[active] : null

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/properties/search?q=${encodeURIComponent(q)}`)
    } else if (persona.purpose) {
      router.push(`/properties?purpose=${persona.purpose}`)
    } else {
      router.push("/properties")
    }
  }

  const showSearch = persona.purpose !== null

  const marquee = (ticker.length > 1 ? [...ticker, ...ticker] : ticker).map(
    (item, idx) => ({ ...item, key: `${item.slug}-${idx}` })
  )

  return (
    <section
      className="relative flex min-h-[560px] flex-col overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent pb-16 pt-16 sm:min-h-[620px] sm:pb-20 sm:pt-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Featured listing image fills the hero as its background */}
      {slide && (
        <div key={`${persona.id}-${slide.slug}`} className="absolute inset-0 animate-[fadeUp_0.6s_ease-out]">
          <img
            src={optimizeImageUrl(slide.image, 1920)}
            alt={`${slide.title} in ${slide.city}`}
            className="h-full w-full object-cover"
            fetchPriority={persona.id === "buy" ? "high" : "auto"}
            decoding="async"
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
        {/* Persona switcher */}
        <div
          role="group"
          aria-label="Choose what you are looking for"
          className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/20 bg-black/25 p-1.5 backdrop-blur-md"
        >
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={persona.id === p.id}
              onClick={() => switchPersona(p)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                persona.id === p.id
                  ? "bg-white text-primary shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <h1
          key={`${persona.id}-headline`}
          className="mx-auto mt-6 max-w-4xl animate-[fadeUp_0.5s_ease-out] text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl"
        >
          {persona.headlineTop}
          <span className={`block ${persona.accentClass}`}>{persona.headlineAccent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:text-lg">
          {persona.subtitle}
        </p>

        {showSearch ? (
          <form
            onSubmit={submitSearch}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/20 bg-black/25 p-1.5 backdrop-blur-md"
          >
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <Search size={18} className="text-white/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={persona.placeholder}
                aria-label="Search properties"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-teal-50"
            >
              Search
            </button>
          </form>
        ) : (
          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/listings/new"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-teal-50"
            >
              Create a listing
            </Link>
            <Link
              href="/agents"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Talk to an APL rep
            </Link>
          </div>
        )}

        {/* Featured listing caption card */}
        {showSearch && !loaded && (
          <div className="mx-auto mt-10 w-full max-w-4xl animate-pulse rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="h-3 w-28 rounded bg-white/25" />
            <div className="mt-3 h-5 w-2/3 rounded bg-white/25" />
            <div className="mt-2 h-4 w-32 rounded bg-white/25" />
          </div>
        )}
        {showSearch && loaded && slide && (
          <div
            key={`${persona.id}-card`}
            className="mx-auto mt-10 w-full max-w-4xl animate-[fadeUp_0.5s_ease-out] rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur-md sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/properties/${(slide.city || "kenya").toLowerCase()}/${slide.slug}`}
                className="group min-w-0 flex-1 text-left"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  {persona.featuredLabel}
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

      {/* Fresh on the market ticker */}
      {ticker.length > 0 && (
        <div
          className="relative z-10 mt-12 border-t border-white/10 bg-black/30 backdrop-blur-md"
          onMouseEnter={handleTickerEnter}
          onMouseLeave={handleTickerLeave}
        >
          <div className="container mx-auto flex max-w-7xl items-center gap-6 overflow-hidden px-4">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-accent-300">
              Fresh on the market
            </span>
            <div ref={tickerRegionRef} className="overflow-hidden py-3">
              <div
                ref={tickerTrackRef}
                className="flex w-max gap-8"
                style={{
                  transform: `translateX(${tickerOffset}px)`,
                  transition: gliding ? "transform 0.6s ease" : "none",
                }}
              >
                {marquee.map((item) => (
                  <Link
                    key={item.key}
                    href={`/properties/${(item.city || "kenya").toLowerCase()}/${item.slug}`}
                    onMouseEnter={(e) => handleTickerItemEnter(e.currentTarget)}
                    className="group flex shrink-0 items-baseline gap-2.5 whitespace-nowrap rounded-lg px-3 py-1 text-sm text-white/80 transition-all duration-300 hover:scale-110 hover:bg-accent-300/15 hover:shadow-[0_0_18px_rgba(212,154,68,0.55)] hover:text-white"
                  >
                    <span className="font-medium">{item.city || "Kenya"}</span>
                    <span className="truncate text-white/60">{item.title}</span>
                    <span className="font-heading font-bold text-accent-300 transition-colors group-hover:text-accent-200">
                      {formatPrice(item.price, item.listingPurpose ?? undefined)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}