"use client"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronDown } from "@/components/ui/icons"
import { useAuth } from "@/lib/auth-context"

const AUTO_INTERVAL_MS = 6000

interface HeroSlide {
  eyebrow: string
  title: string
  subtitle: string
  desktop: string
  mobile: string
  alt: string
}

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "WHERE KENYA",
    title: "LINKS",
    subtitle: "Meet Verified Opportunity — one link to owners, agents & certified fundis.",
    desktop: "/hero/desktop/where-kenya-links.jpg",
    mobile: "/hero/mobile/where-kenya-links.jpg",
    alt: "Where Kenya links — verified property opportunities",
  },
  {
    eyebrow: "LIST ONCE,",
    title: "REACH CLIENTS COUNTRYWIDE",
    subtitle: "Advertise sale, rent, land or Airbnb — connect direct, no middlemen.",
    desktop: "/hero/desktop/list-once.jpg",
    mobile: "/hero/mobile/list-once.jpg",
    alt: "List once, reach clients countrywide",
  },
  {
    eyebrow: "FIND VERIFIED",
    title: "AGENTS & REAL OWNERS",
    subtitle: "Rent or buy with ID-checked agents. Call or WhatsApp direct.",
    desktop: "/hero/desktop/verified-agents.jpg",
    mobile: "/hero/mobile/verified-agents.jpg",
    alt: "Find verified agents and real owners",
  },
  {
    eyebrow: "EXPLORE PROPERTIES",
    title: "THAT HOLD VALUE",
    subtitle: "From Nairobi to Diani, Nakuru to Eldoret — verified listings for you.",
    desktop: "/hero/desktop/hold-value.jpg",
    mobile: "/hero/mobile/hold-value.jpg",
    alt: "Explore properties that hold value across Kenya",
  },
  {
    eyebrow: "FIND PROS",
    title: "FOR YOUR SERVICE NEEDS",
    subtitle: "Cleaning, moving, security, catering, web development...",
    desktop: "/hero/desktop/find-pros.jpg",
    mobile: "/hero/mobile/find-pros.jpg",
    alt: "Find pros for your service needs",
  },
  {
    eyebrow: "HIRE A FUNDI",
    title: "NEAR YOU",
    subtitle: "Plumber, electrician, mason, carpenter, painter — ID-checked. Call or WhatsApp direct, zero markup.",
    desktop: "/hero/desktop/hire-fundi.jpg",
    mobile: "/hero/mobile/hire-fundi.jpg",
    alt: "Hire a fundi near you",
  },
]

// Split-button dropdown menus: the main half keeps the original destination,
// the chevron half opens instant category shortcuts.
const SEARCH_MENU: { label: string; href: string }[] = [
  { label: "Property", href: "/properties" },
  { label: "AirBnB", href: "/airbnbs" },
  { label: "Land", href: "/land" },
]

const FIND_MENU: { label: string; href: string }[] = [
  { label: "Fundi", href: "/services?type=FUNDI" },
  { label: "Service Provider", href: "/services?type=SERVICE_PROVIDER" },
]

const CROSSFADE_MS = 700

export function HeroSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [prev, setPrev] = useState<number | null>(null)
  const [openMenu, setOpenMenu] = useState<"search" | "find" | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const findRef = useRef<HTMLDivElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const findToggleRef = useRef<HTMLButtonElement>(null)
  const { user } = useAuth()
  const prevActiveRef = useRef(0)
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), AUTO_INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused])

  // Keep previous slide mounted for the crossfade duration, then unmount
  useEffect(() => {
    const old = prevActiveRef.current
    if (old !== active) {
      setPrev(old)
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
      unmountTimerRef.current = setTimeout(() => setPrev(null), CROSSFADE_MS)
      prevActiveRef.current = active
    }
  }, [active])

  useEffect(() => {
    return () => {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
    }
  }, [])

  // Close the open dropdown on outside tap or Escape (returning focus to its chevron)
  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: PointerEvent) => {
      const el = openMenu === "search" ? searchRef.current : findRef.current
      if (el && !el.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null)
        ;(openMenu === "search" ? searchToggleRef.current : findToggleRef.current)?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [openMenu])

  const slide = SLIDES[active]
  const visibleIndexes = prev !== null && prev !== active ? [prev, active] : [active]
  const advertiseHref = user ? "/dashboard/listings/new" : "/auth/login?next=/dashboard/listings/new"

  return (
    <section
      aria-label="Featured highlights"
      className="relative -mt-16 h-screen min-h-[600px] w-full overflow-hidden bg-primary-900 font-heading lg:-mt-[76px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides — crossfade (CSS opacity only; only active + previous mounted) */}
      <div role="region" aria-roledescription="carousel" aria-label="Property highlights" aria-live="off" className="absolute inset-0">
        {visibleIndexes.map((i) => {
          const s = SLIDES[i]
          const isActive = i === active
          return (
            <div
              key={s.desktop}
              aria-hidden={isActive ? undefined : "true"}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              <Image
                src={s.desktop}
                alt={isActive ? s.alt : ""}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="hidden h-full w-full object-cover md:block"
              />
              <Image
                src={s.mobile}
                alt=""
                aria-hidden="true"
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="h-full w-full object-cover md:hidden"
              />
            </div>
          )
        })}
        {/* Legibility scrim */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-primary-900/80 via-primary-900/25 to-primary-900/40" aria-hidden="true" />
      </div>

      {/* Copy — h1 rendered once (no key remount); slide changes announced via status region */}
      <div className="absolute inset-0 z-30 mx-auto flex w-full max-w-content flex-col justify-end px-3 pb-24 pt-16 sm:px-4 sm:pb-28 lg:px-6 lg:pb-24">
        <div className="max-w-3xl">
          <p className="font-heading text-[28px] font-medium uppercase leading-[1.25] text-white sm:text-[37px]">
            {slide.eyebrow}
          </p>
          <h1 className="mt-1 font-heading text-[40px] font-semibold uppercase leading-[1.25] text-white drop-shadow-md sm:text-[53px]">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-xl font-heading text-[18px] font-normal leading-[1.6] text-white sm:text-[20px]">{slide.subtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {/* 1 — List Property: original button, untouched */}
            <Link
              href={advertiseHref}
              className="inline-flex min-h-touch items-center justify-center rounded border-[1.25px] border-white bg-black/20 px-6 py-3 font-heading text-[16px] font-medium tracking-[0.4px] text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              List Property
            </Link>

            {/* 2 — Search Property split button: main half navigates, chevron opens categories */}
            <div ref={searchRef} className="relative flex flex-col sm:w-auto">
              <div className="inline-flex items-stretch">
              <Link
                href="/properties"
                className={`inline-flex min-h-touch flex-1 items-center justify-center rounded-l border-[1.25px] border-r-0 border-white bg-black/20 px-6 py-3 font-heading text-[16px] font-medium tracking-[0.4px] text-white backdrop-blur-[2px] transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white${openMenu === "search" ? " max-sm:rounded-bl-none sm:rounded-tl-none" : ""}`}
              >
                Search Property
              </Link>
              <button
                ref={searchToggleRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={openMenu === "search"}
                aria-label="More search options: property, Airbnb, land"
                onClick={() => setOpenMenu((m) => (m === "search" ? null : "search"))}
                className={`inline-flex min-h-touch w-touch items-center justify-center rounded-r border-[1.25px] border-l-white/40 border-white bg-black/20 font-heading text-white backdrop-blur-[2px] transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white${openMenu === "search" ? " max-sm:rounded-br-none sm:rounded-tr-none" : ""}`}
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${openMenu === "search" ? "rotate-180" : ""}`}
                />
              </button>
              </div>
              {openMenu === "search" && (
                <ul
                  aria-label="Search categories"
                  className="z-40 overflow-hidden rounded-md border border-white bg-black/60 py-1 shadow-lg backdrop-blur-md max-sm:static max-sm:-mt-[1.25px] max-sm:rounded-t-none sm:absolute sm:inset-x-0 sm:bottom-full sm:-mb-[1.25px] sm:rounded-b-none"
                >
                  {SEARCH_MENU.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenMenu(null)}
                        className="flex min-h-touch items-center px-4 font-heading text-[16px] font-medium tracking-[0.4px] text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3 — Find split button: main half navigates, chevron opens categories */}
            <div ref={findRef} className="relative flex flex-col sm:w-auto">
              <div className="inline-flex items-stretch">
              <Link
                href="/services?type=FUNDI"
                className={`inline-flex min-h-touch flex-1 items-center justify-center rounded-l border-[1.25px] border-r-0 border-white bg-black/20 px-6 py-3 font-heading text-[16px] font-medium tracking-[0.4px] text-white backdrop-blur-[2px] transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white${openMenu === "find" ? " max-sm:rounded-bl-none sm:rounded-tl-none" : ""}`}
              >
                Find a Fundi
              </Link>
              <button
                ref={findToggleRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={openMenu === "find"}
                aria-label="More options: fundi, service provider"
                onClick={() => setOpenMenu((m) => (m === "find" ? null : "find"))}
                className={`inline-flex min-h-touch w-touch items-center justify-center rounded-r border-[1.25px] border-l-white/40 border-white bg-black/20 font-heading text-white backdrop-blur-[2px] transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white${openMenu === "find" ? " max-sm:rounded-br-none sm:rounded-tr-none" : ""}`}
              >
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${openMenu === "find" ? "rotate-180" : ""}`}
                />
              </button>
              </div>
              {openMenu === "find" && (
                <ul
                  aria-label="Service categories"
                  className="z-40 overflow-hidden rounded-md border border-white bg-black/60 py-1 shadow-lg backdrop-blur-md max-sm:static max-sm:-mt-[1.25px] max-sm:rounded-t-none sm:absolute sm:inset-x-0 sm:bottom-full sm:-mb-[1.25px] sm:rounded-b-none"
                >
                  {FIND_MENU.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenMenu(null)}
                        className="flex min-h-touch items-center px-4 font-heading text-[16px] font-medium tracking-[0.4px] text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* Polite slide-change announcement (visually hidden, never keyed) */}
        <p role="status" aria-live="polite" className="sr-only">
          {`Slide ${active + 1} of ${SLIDES.length}: ${slide.eyebrow} ${slide.title}`}
        </p>
      </div>

      {/* Dots + pause/play — desktop: docked right to clear the CTA row; mobile: centered below copy */}
      <div className="absolute inset-x-0 bottom-6 z-30 mx-auto flex w-full max-w-content items-center justify-center px-3 sm:px-4 lg:justify-end lg:px-6">
        <div className="flex items-center" role="group" aria-label="Choose highlight">
          {SLIDES.map((s, i) => (
            <button
              key={s.desktop}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${s.eyebrow} ${s.title}`}
              aria-current={i === active ? "true" : undefined}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center p-3"
            >
              <span
                aria-hidden="true"
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className="ml-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-[1.25px] border-white bg-black/20 p-3 font-heading text-[16px] font-medium text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-primary"
        >
          <span aria-hidden="true" className="flex w-4 items-center justify-center">
            {paused ? (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                <path d="M0 0l12 7-12 7z" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                <rect x="0" y="0" width="4" height="14" rx="1" />
                <rect x="8" y="0" width="4" height="14" rx="1" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </section>
  )
}
