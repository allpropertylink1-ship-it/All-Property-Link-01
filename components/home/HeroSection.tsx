"use client"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

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

const HERO_CTAS = [
  { label: "Advertise Property", href: "/dashboard/listings/new" },
  { label: "Search Property", href: "/properties" },
  { label: "Find a Fundi", href: "/services?type=FUNDI" },
]

export function HeroSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    if (paused) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), AUTO_INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused])

  const slide = SLIDES[active]

  return (
    <section
      aria-label="Featured highlights"
      className="relative -mt-16 h-screen min-h-[600px] w-full overflow-hidden bg-primary-900 font-heading lg:-mt-[76px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides — crossfade */}
      <div role="region" aria-roledescription="carousel" aria-label="Property highlights" className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <div
            key={s.desktop}
            aria-hidden={i === active ? undefined : "true"}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === active ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <Image
              src={s.desktop}
              alt={i === active ? s.alt : ""}
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
        ))}
        {/* Legibility scrim */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-primary-900/80 via-primary-900/25 to-primary-900/40" aria-hidden="true" />
      </div>

      {/* Copy — desktop: left edge matches navbar logo (same max-w-content + px), bottom matches dots (both 32px) */}
      <div className="absolute inset-0 z-30 mx-auto flex w-full max-w-content flex-col justify-end px-3 pb-24 pt-16 sm:px-4 sm:pb-28 lg:px-6 lg:pb-8">
        <div key={active} className="max-w-3xl animate-[fadeUp_0.5s_ease-out]">
          <p className="font-heading text-[28px] font-medium uppercase leading-[1.25] text-white sm:text-[37px]">
            {slide.eyebrow}
          </p>
          <h1 className="mt-1 font-heading text-[40px] font-semibold uppercase leading-[1.25] text-white drop-shadow-md sm:text-[53px]">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-xl font-heading text-[18px] font-normal leading-[1.6] text-white sm:text-[20px]">{slide.subtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {HERO_CTAS.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className="inline-flex min-h-touch items-center justify-center rounded border-[1.25px] border-white bg-black/20 px-6 py-3 font-heading text-[16px] font-medium tracking-[0.4px] text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-primary sm:w-auto"
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-8 z-30 flex items-center justify-center gap-3" role="group" aria-label="Choose highlight">
        {SLIDES.map((s, i) => (
          <button
            key={s.desktop}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}: ${s.eyebrow} ${s.title}`}
            aria-current={i === active ? "true" : undefined}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
