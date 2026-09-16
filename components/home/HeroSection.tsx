/* eslint-disable @next/next/no-img-element */
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Home,
  Key,
  Tent,
  Trees,
  Wrench,
  BedDouble,
  Bath,
  Maximize2,
  BadgeCheck,
  SlidersHorizontal,
  Phone,
  MessageCircle,
} from "@/components/ui/icons"
import { formatPrice } from "@/lib/utils"
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders"
import { getCoverImage, optimizeImageUrl } from "@/lib/images"
import { slugifyCity } from "@/lib/seo"

const DAY_MS = 24 * 60 * 60 * 1000
const AUTO_INTERVAL_MS = 6000

type PersonaId = "sale" | "rent" | "land" | "stay" | "fundis"

interface Persona {
  id: PersonaId
  label: string
  icon: typeof Home
  headline: React.ReactNode
  subtitle: string
  placeholder: string
  purpose: string | null
  type: string | null
  featuredLabel: string
  service: boolean
}

const PERSONAS: Persona[] = [
  {
    id: "sale",
    label: "Properties For Sale",
    icon: Home,
    headline: (
      <>
        Prime Real Estate &amp; <span className="text-accent-400">Certified Fundis.</span>
      </>
    ),
    subtitle:
      "Browse thousands of properties for sale across Kenya. Connect directly with verified agents and property owners.",
    placeholder: "All counties (Nairobi, Kiambu...)",
    purpose: "FOR_SALE",
    type: null,
    featuredLabel: "Exclusive Signature Listing",
    service: false,
  },
  {
    id: "rent",
    label: "To Let / Rent",
    icon: Key,
    headline: (
      <>
        Rent a Home <span className="text-accent-400">That Feels Like Yours</span>
      </>
    ),
    subtitle:
      "Long-term rentals in neighbourhoods you'll love. Verified listings, real owners, no middlemen.",
    placeholder: "Which town or estate?",
    purpose: "FOR_RENT_LONG_TERM",
    type: null,
    featuredLabel: "Featured rentals",
    service: false,
  },
  {
    id: "land",
    label: "Land & Plots",
    icon: Trees,
    headline: (
      <>
        Prime Land in <span className="text-accent-400">Growth Corridors</span>
      </>
    ),
    subtitle:
      "Surveyed, title-deed-ready parcels in Kenya's fastest capital appreciation corridors.",
    placeholder: "Ruiru, Kangundo Road, Malindi...",
    purpose: null,
    type: "LAND",
    featuredLabel: "Title-deed ready",
    service: false,
  },
  {
    id: "stay",
    label: "Airbnbs & Stays",
    icon: Tent,
    headline: (
      <>
        Weekend Away — Find a <span className="text-accent-400">Short Stay</span>
      </>
    ),
    subtitle:
      "Stays in Diani, Naivasha, Nyahururu and beyond. Book by the night from verified hosts and agents.",
    placeholder: "Beach town or getaway spot...",
    purpose: "FOR_RENT_SHORT_TERM",
    type: null,
    featuredLabel: "Featured stays",
    service: false,
  },
  {
    id: "fundis",
    label: "Verified Fundis",
    icon: Wrench,
    headline: (
      <>
        Certified Fundis, <span className="text-accent-400">Ready for Deployment</span>
      </>
    ),
    subtitle:
      "Identity-checked, trade-certified Kenyan specialists ready for immediate deployment.",
    placeholder: "",
    purpose: null,
    type: null,
    featuredLabel: "",
    service: true,
  },
]

const CLASSIFICATIONS = [
  { value: "", label: "All Categories" },
  { value: "HOUSE", label: "Houses & Villas" },
  { value: "APARTMENT", label: "Modern Apartments" },
  { value: "COMMERCIAL", label: "Commercial / Office" },
  { value: "LAND", label: "Land & Plots" },
]

const BUDGETS = [
  { value: "", label: "Any Budget Tier", min: "", max: "" },
  { value: "under-20m", label: "Under KES 20,000,000", min: "", max: "20000000" },
  { value: "20m-60m", label: "KES 20M – KES 60M", min: "20000000", max: "60000000" },
  { value: "60m-150m", label: "KES 60M – KES 150M", min: "60000000", max: "150000000" },
  { value: "150m-plus", label: "KES 150M+ (Prime Luxury)", min: "150000000", max: "" },
]

interface Slide {
  slug: string
  title: string
  price: number | null
  city: string
  region?: string | null
  propertyType?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  listingPurpose: string | null
  image: string
  phone?: string | null
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
  coverImage?: string | null
  images: unknown
  agent?: { phone?: string | null } | null
}

function agentPhone(p: ApiProperty): string | null {
  const raw = p.agent?.phone
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

function waNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) digits = `254${digits.slice(1)}`
  return digits
}

function toSlides(rows: ApiProperty[]): Slide[] {
  const slides: Slide[] = []
  for (const p of rows) {
    const cover = getCoverImage(p as { coverImage?: string | null; images?: unknown })
    if (!cover) continue
    slides.push({
      slug: p.slug,
      title: p.title,
      price: p.price == null ? null : Number(p.price),
      city: p.city ?? "",
      region: p.region ?? null,
      propertyType: p.propertyType ?? null,
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      area: p.area ?? null,
      listingPurpose: p.listingPurpose ?? null,
      image: cover,
      phone: agentPhone(p),
    })
  }
  return slides
}

function personaQuery(p: Persona): string | null {
  if (p.service) return null
  const params = new URLSearchParams()
  if (p.purpose) params.set("purpose", p.purpose)
  if (p.type) params.set("type", p.type)
  params.set("limit", "8")
  return params.toString()
}

export function HeroSection() {
  const router = useRouter()
  const [persona, setPersona] = useState<Persona>(PERSONAS[0])
  const [slides, setSlides] = useState<Slide[]>([])
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [paused, setPaused] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [classification, setClassification] = useState("")
  const [budget, setBudget] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Map<string, Slide[]>>(new Map())

  const loadSlides = (next: Persona) => {
    const q = personaQuery(next)
    if (!q) {
      setSlides([])
      setLoaded(true)
      return
    }
    const cached = cacheRef.current.get(q)
    if (cached) {
      setSlides(cached)
      setActive(cached.length > 0 ? Math.floor(Date.now() / (DAY_MS * 2)) % cached.length : 0)
      setLoaded(true)
      return
    }
    setLoaded(false)
    fetch(`/api/properties?${q}`)
      .then((r) => (r.ok ? r.json() : { properties: [] }))
      .catch(() => ({ properties: [] }))
      .then((res) => {
        const nextSlides = toSlides(res.properties || []).slice(0, 8)
        cacheRef.current.set(q, nextSlides)
        setSlides(nextSlides)
        if (nextSlides.length > 0) {
          setActive(Math.floor(Date.now() / (DAY_MS * 2)) % nextSlides.length)
        }
        setLoaded(true)
      })
  }

  useEffect(() => {
    loadSlides(PERSONAS[0])
    fetch("/api/properties?limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((res) => {
        if (res && typeof res.total === "number") setTotal(res.total)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchPersona = (next: Persona) => {
    setPersona(next)
    setActive(0)
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    setClassification(next.type ?? "")
    setBudget("")
    loadSlides(next)
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

  const executeSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (persona.service) {
      const q = query.trim()
      router.push(q ? `/services?search=${encodeURIComponent(q)}` : "/services")
      return
    }
    const params = new URLSearchParams()
    if (persona.purpose) params.set("purpose", persona.purpose)
    const type = classification || persona.type
    if (type) params.set("type", type)
    const tier = BUDGETS.find((b) => b.value === budget)
    if (tier?.min) params.set("minPrice", tier.min)
    if (tier?.max) params.set("maxPrice", tier.max)
    const q = query.trim()
    if (q) params.set("search", q)
    const qs = params.toString()
    router.push(qs ? `/properties?${qs}` : "/properties")
  }

  const handleSearchInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const base = personaQuery(persona)
    if (!value.trim() || !base) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(base)
      params.set("search", value)
      params.set("limit", "5")
      fetch(`/api/properties?${params.toString()}`)
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

  return (
    <section aria-label="Featured listings and search" className="bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:pt-8">
        {/* Title & value statement header — desktop only (mobile goes straight to search) */}
        <div className="mb-6 hidden flex-col justify-between gap-4 md:flex md:flex-row md:items-end">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-surface-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <BadgeCheck size={14} className="text-primary" aria-hidden="true" />
              Direct Deal Infrastructure • Kenya
            </p>
            <h1
              key={`${persona.id}-headline`}
              className="max-w-3xl animate-[fadeUp_0.5s_ease-out] font-heading text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
            >
              {persona.headline}
            </h1>
            <p className="mt-2 max-w-text text-sm text-text-secondary sm:text-base">
              {persona.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-success-500" />
              {total != null ? `${total.toLocaleString()}+ Verified Assets` : "Verified Assets"}
            </p>
            {slides.length > 1 && (
              <div className="flex items-center gap-2" role="group" aria-label="Hero carousel controls">
                <button
                  type="button"
                  aria-label="Previous featured listing"
                  onClick={() => go(-1)}
                  className="flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-surface-secondary text-primary transition-colors hover:bg-primary/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next featured listing"
                  onClick={() => go(1)}
                  className="flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-primary text-text-onPrimary shadow-sm transition-colors hover:bg-primary-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero visual showcase / dynamic carousel frame */}
        <div
          className="relative h-[420px] w-full overflow-hidden rounded-xl bg-primary shadow-lg sm:h-[480px] lg:h-[520px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured listings"
        >
          {slide && (
            <div key={`${persona.id}-${slide.slug}`} className="absolute inset-0 animate-[fadeUp_0.6s_ease-out]">
              <img
                src={optimizeImageUrl(slide.image, 1920)}
                alt={`${slide.title} in ${slide.city}`}
                className="h-full w-full object-cover"
                fetchPriority={persona.id === "sale" ? "high" : "auto"}
                decoding="async"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = PLACEHOLDER_PROPERTY
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-4 text-white sm:p-6 md:flex-row md:items-end md:justify-between lg:p-8">
                <div className="max-w-2xl">
                  <p className="mb-2 inline-flex items-center rounded-lg bg-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    {persona.featuredLabel}{slide.city ? ` • ${slide.city}` : ""}
                  </p>
                  <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                    {slide.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} aria-hidden="true" />
                      {slide.city}{slide.region && slide.region !== slide.city ? ` • ${slide.region}` : ""}
                    </span>
                    {slide.bedrooms != null && slide.bedrooms > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <BedDouble size={14} aria-hidden="true" />
                        {slide.bedrooms} Beds
                      </span>
                    )}
                    {slide.bathrooms != null && slide.bathrooms > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Bath size={14} aria-hidden="true" />
                        {slide.bathrooms} Baths
                      </span>
                    )}
                    {slide.area != null && slide.area > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Maximize2 size={14} aria-hidden="true" />
                        {slide.area}m²
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    {persona.id === "rent" || persona.id === "stay" ? "Starting At" : "Asking Valuation"}
                  </span>
                  <span className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {formatPrice(slide.price, slide.listingPurpose ?? undefined)}
                  </span>
                  <div className="mt-2 flex flex-wrap items-center gap-2 md:justify-end">
                    <Link
                      href={`/properties/${slugifyCity(slide.city || "kenya")}/${slide.slug}`}
                      className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-50"
                    >
                      View Listing
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                    {slide.phone ? (
                      <>
                        <a
                          href={`tel:${slide.phone}`}
                          aria-label={`Call agent about ${slide.title}`}
                          className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                        >
                          <Phone size={15} aria-hidden="true" />
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${waNumber(slide.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp agent about ${slide.title}`}
                          className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-whatsapp-dark"
                        >
                          <MessageCircle size={15} aria-hidden="true" />
                          WhatsApp
                        </a>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!slide && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary via-primary-700 to-primary-900 p-6 text-center">
              {persona.service ? (
                <>
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Wrench size={28} aria-hidden="true" />
                  </span>
                  <h2 className="max-w-xl font-heading text-2xl font-bold text-white sm:text-3xl">
                    {persona.headline}
                  </h2>
                  <p className="max-w-xl text-sm text-white/75">{persona.subtitle}</p>
                  <Link
                    href="/services"
                    className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-accent-600"
                  >
                    Browse Verified Fundis
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3" aria-busy={!loaded} aria-label="Loading featured listings">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <p className="text-sm text-white/75">Loading featured listings…</p>
                </div>
              )}
            </div>
          )}
          {slides.length > 1 && (
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary-900/40 px-3 py-2 backdrop-blur-md" role="group" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  aria-label={`Go to listing ${i + 1}: ${s.title}`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile region context + For Sale / To Let segmented (Stitch mobile hero) */}
        <div className="mb-3 rounded-xl border border-border bg-surface p-3 shadow-sm md:hidden">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-primary">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Search Region
                </span>
                <span className="block truncate text-sm font-bold text-text-primary">
                  Nairobi &amp; Kiambu, KE
                </span>
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold text-accent-700">
              <BadgeCheck size={14} aria-hidden="true" />
              Vetted Hub
            </span>
          </div>
          <div className="flex items-center rounded-xl bg-surface-secondary p-1" role="group" aria-label="Listing type">
            <button
              type="button"
              aria-pressed={persona.id === "sale"}
              onClick={() => switchPersona(PERSONAS[0])}
              className={`min-h-touch flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
                persona.id === "sale"
                  ? "bg-primary text-text-onPrimary shadow-sm"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              For Sale
            </button>
            <button
              type="button"
              aria-pressed={persona.id === "rent"}
              onClick={() => switchPersona(PERSONAS[1])}
              className={`min-h-touch flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
                persona.id === "rent"
                  ? "bg-primary text-text-onPrimary shadow-sm"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              To Let (Rent)
            </button>
          </div>
        </div>

        {/* Integrated multi-tab quick search console (overlapping card) */}
        <div className="relative z-20 mx-auto -mt-12 w-full max-w-5xl rounded-xl border border-border bg-surface p-3 shadow-lg sm:p-4">
          <div
            className="mb-3 flex items-center gap-1.5 overflow-x-auto border-b border-border pb-3 scrollbar-hide"
            role="group"
            aria-label="Choose what you are looking for"
          >
            {PERSONAS.map((p) => {
              const Icon = p.icon
              const selected = persona.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => switchPersona(p)}
                  className={`flex min-h-touch shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all sm:text-sm ${
                    selected
                      ? "bg-primary text-text-onPrimary shadow-sm"
                      : "bg-surface-secondary text-text-secondary hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {p.label}
                </button>
              )
            })}
          </div>
          <form onSubmit={executeSearch} className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-12">
            <div className="relative flex flex-col gap-1.5 lg:col-span-4" role="combobox" aria-controls="hero-location-suggestions" aria-expanded={showSuggestions && suggestions.length > 0}>
              <label htmlFor="hero-location" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <MapPin size={14} className="text-primary" aria-hidden="true" />
                {persona.service ? "Trade or Service" : "County & Enclave"}
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 shrink-0 text-text-secondary" aria-hidden="true" />
                <input
                  id="hero-location"
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={persona.service ? "Plumbing, catering, repairs..." : persona.placeholder}
                  aria-label={persona.service ? "Search fundis and services" : "Search by location"}
                  aria-autocomplete="list"
                  autoComplete="off"
                  className="min-h-touch w-full rounded-lg border border-border bg-surface-secondary py-2.5 pl-9 pr-3 text-[16px] text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  id="hero-location-suggestions"
                  role="listbox"
                  className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-60 animate-[fadeUp_0.15s_ease-out] overflow-y-auto rounded-xl border border-border bg-surface shadow-xl"
                >
                  {suggestions.map((item, idx) => (
                    <li key={`${item.slug}-${idx}`} role="option" aria-selected="false">
                      <Link
                        href={`/properties/${slugifyCity(item.city || "kenya")}/${item.slug}`}
                        onClick={() => {
                          setQuery("")
                          setShowSuggestions(false)
                        }}
                        className="flex items-start gap-2.5 border-b border-border px-3 py-2.5 text-text-primary transition-colors last:border-0 hover:bg-surface-secondary"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
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
            </div>
            {!persona.service && (
              <>
                <div className="flex flex-col gap-1.5 lg:col-span-3">
                  <label htmlFor="hero-classification" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Home size={14} className="text-primary" aria-hidden="true" />
                    Asset Classification
                  </label>
                  <select
                    id="hero-classification"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="min-h-touch w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-[16px] font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CLASSIFICATIONS.map((c) => (
                      <option key={c.value || "all"} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 lg:col-span-2">
                  <label htmlFor="hero-budget" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <SlidersHorizontal size={14} className="text-primary" aria-hidden="true" />
                    Budget (KES)
                  </label>
                  <select
                    id="hero-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="min-h-touch w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-[16px] font-semibold text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {BUDGETS.map((b) => (
                      <option key={b.value || "any"} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className={persona.service ? "md:col-span-2 lg:col-span-8" : "lg:col-span-3"}>
              <button
                type="submit"
                className="flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-[16px] font-bold text-white shadow-md transition-colors hover:bg-accent-600"
              >
                <Search size={18} aria-hidden="true" />
                Execute Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
