/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Search } from "@/components/ui/icons"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders"
import { optimizeImageUrl } from "@/lib/images"
import { slugifyCity } from "@/lib/seo"

const DAY_MS = 24 * 60 * 60 * 1000
const AUTO_INTERVAL_MS = 6000

type PersonaId = "buy" | "rent" | "stay" | "list"

interface Persona {
  id: PersonaId
  label: string
  headline: React.ReactNode
  subtitle: string
  placeholder: string
  purpose: string | null
  featuredLabel: string
}

const PERSONAS: Persona[] = [
  {
    id: "buy",
    label: "Buy",
    headline: (
      <>
        Find Your Ideal{" "}
        <span className="text-accent-300">Property in Kenya</span>
      </>
    ),
    subtitle:
      "Browse thousands of properties for sale across Kenya. Connect directly with verified agents and property owners.",
    placeholder: "City, estate, or property type...",
    purpose: "FOR_SALE",
    featuredLabel: "Featured for sale",
  },
  {
    id: "rent",
    label: "Rent",
    headline: (
      <>
        Rent a Home{" "}
        <span className="text-accent-300">That Feels Like Yours</span>
      </>
    ),
    subtitle:
      "Long-term rentals in neighbourhoods you'll love. Verified listings, real owners, no middlemen.",
    placeholder: "Which town or estate?",
    purpose: "FOR_RENT_LONG_TERM",
    featuredLabel: "Featured rentals",
  },
  {
    id: "stay",
    label: "Book a Short Stay",
    headline: (
      <>
        Weekend Away \u2014 Find a{" "}
        <span className="text-accent-300">Short Stay</span>
      </>
    ),
    subtitle:
      "Stays in Diani, Naivasha, Nyahururu and beyond. Book by the night from verified hosts and agents.",
    placeholder: "Beach town or getaway spot...",
    purpose: "FOR_RENT_SHORT_TERM",
    featuredLabel: "Featured stays",
  },
  {
    id: "list",
    label: "List",
    headline: (
      <>
        List Your Property{" "}
        <span className="text-accent-300">Direct to Verified Buyers</span>
      </>
    ),
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

interface SearchSuggestion {
  slug: string
  title: string
  city: string
  region?: string | null
  propertyType?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  listingPurpose?: string | null
  price?: number | null
}

interface ApiProperty {
  slug: string
  title: string
  price: number | string | null
  city: string
  region?: string | null
  propertyType?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  listingPurpose?: string | null
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
      listingPurpose: p.listingPurpose ?? null,
      image: imgs[0],
    })
  }
  return slides
}

export function HeroSection() {
  const router = useRouter()
  const [persona, setPersona] = useState<Persona>(PERSONAS[0])
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Map<string, Slide[]>>(new Map())

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setShowSuggestions(false)
  }

  const handleSearchInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim() || !persona.purpose) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/properties?purpose=${persona.purpose}&search=${encodeURIComponent(value)}&limit=5`)
        .then((r) => (r.ok ? r.json() : { properties: [] }))
        .catch(() => ({ properties: [] }))
        .then((res) => {
          const props = res.properties || []
          const next: SearchSuggestion[] = props.slice(0, 5).map((p: ApiProperty) => ({
            slug: p.slug,
            title: p.title,
            city: p.city ?? "",
            region: p.region ?? null,
            propertyType: p.propertyType ?? null,
            bedrooms: p.bedrooms ?? null,
            bathrooms: p.bathrooms ?? null,
            area: p.area ?? null,
            listingPurpose: p.listingPurpose ?? null,
            price: p.price == null ? null : Number(p.price),
          }))
          setSuggestions(next)
          setShowSuggestions(next.length > 0)
        })
    }, 200)
  }

  const handleSearchFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const showSearch = persona.purpose !== null

  return (
    <section
      className="relative flex min-h-[clamp(520px,100svh,620px)] flex-col overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent pb-3 pt-3 sm:pb-5 sm:pt-5"
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
      <div className="container relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 text-center">
        {/* Top section: Unified persona tabs + search bar + headline */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 relative z-50">
          {/* Unified bar: Persona tabs + search */}
          <div
            role="group"
            aria-label="Choose what you are looking for"
            className="mx-auto flex w-full max-w-5xl items-center gap-2 rounded-2xl border border-white/20 bg-black/25 p-1.5 backdrop-blur-md relative overflow-visible"
          >
            {/* Persona tabs on the left */}
            <div className="flex items-center gap-1 flex-shrink-0" role="group" aria-label="Property type">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={persona.id === p.id}
                  onClick={() => switchPersona(p)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
                    persona.id === p.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search input with autocomplete - fills remaining space */}
            {showSearch && (
              <div className="relative flex flex-1 ml-2" role="combobox" aria-controls="search-suggestions" aria-expanded={showSuggestions && suggestions.length > 0}>
                <form onSubmit={submitSearch} className="w-full">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 flex-shrink-0" aria-hidden="true" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onFocus={handleSearchFocus}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={persona.placeholder}
                      aria-label="Search properties"
                      aria-autocomplete="list"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent-300/30 focus:border-accent-300 transition-all"
                      autoComplete="off"
                    />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      id="search-suggestions"
                      role="listbox"
                      className="absolute top-full left-[-110px] right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-white border border-border shadow-xl z-50 animate-[fadeIn_0.15s_ease-out]"
                    >
                      {suggestions.map((item, idx) => (
                        <li key={`${item.slug}-${idx}`} role="option" aria-selected="false">
                          <Link
                            href={`/properties/${slugifyCity(item.city || "kenya")}/${item.slug}`}
                            onClick={() => {
                              setQuery("")
                              setShowSuggestions(false)
                            }}
                            className="flex items-start gap-3 px-4 py-2.5 text-text-primary hover:bg-surface-secondary transition-colors border-b border-border last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                <span className="font-medium">{item.city}</span>
                                {item.region && item.region !== item.city && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{item.region}</span>
                                  </>
                                )}
                                {item.propertyType && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="capitalize">{item.propertyType.toLowerCase()}</span>
                                  </>
                                )}
                                {item.bedrooms != null && item.bedrooms > 0 && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{item.bedrooms} bed{item.bedrooms > 1 ? "s" : ""}</span>
                                  </>
                                )}
                                {item.bathrooms != null && item.bathrooms > 0 && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{item.bathrooms} bath{item.bathrooms > 1 ? "s" : ""}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </form>
              </div>
            )}

            {/* List persona CTAs - when no search (only Create a listing) */}
            {!showSearch && (
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Link
                  href="/dashboard/listings/new"
                  className="rounded-xl bg-white px-4 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-teal-50"
                >
                  Create a listing
                </Link>
              </div>
            )}
          </div>

          {/* Headline directly under tabs */}
          <h1
            key={`${persona.id}-headline`}
            className="mx-auto max-w-4xl animate-[fadeUp_0.5s_ease-out] text-[clamp(1.25rem,5.5vw,1.75rem)] font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-3xl lg:text-4xl"
          >
            {persona.headline}
          </h1>
        </div>

        {/* Bottom section: Featured listing card - lowered with more bottom padding */}
        <div className="flex flex-col items-center gap-4 pb-8">
          {/* Featured listing caption card */}
          {showSearch && !loaded && (
            <div className="mx-auto w-full max-w-4xl animate-pulse rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="h-3 w-28 rounded bg-white/25" />
              <div className="mt-2 h-4 w-2/3 rounded bg-white/25" />
              <div className="mt-1.5 h-3.5 w-28 rounded bg-white/25" />
            </div>
          )}
          {showSearch && loaded && slide && (
            <div
              key={`${persona.id}-card`}
              className="mx-auto w-full max-w-4xl animate-[fadeUp_0.5s_ease-out] rounded-2xl border border-white/20 bg-black/30 p-3 backdrop-blur-md sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/properties/${slugifyCity(slide.city || "kenya")}/${slide.slug}`}
                  className="group min-w-0 flex-1 text-left"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    {persona.featuredLabel}
                  </p>
                  <h2 className="mt-0.5 truncate font-heading text-sm font-bold leading-tight text-white sm:text-base">
                    {slide.title}
                  </h2>
                  <p className="mt-0.5 font-heading text-sm font-bold text-accent-300 sm:text-base">
                    {formatPrice(slide.price, slide.listingPurpose ?? undefined)}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/properties/${slugifyCity(slide.city || "kenya")}/${slide.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-teal-50"
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
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        type="button"
                        aria-label="Next listing"
                        onClick={() => go(1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {slides.length > 1 && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
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
      </div>
    </section>
  )
}