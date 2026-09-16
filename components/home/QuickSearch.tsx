"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, MapPin } from "@/components/ui/icons"
import { slugifyCity } from "@/lib/seo"
import { fetchCityCounts } from "@/lib/cities-client"

interface CityItem { city: string; count: number }

const COLLAPSED_HEIGHT = 68

export function QuickSearch() {
  const [cities, setCities] = useState<CityItem[]>([])
  const [expanded, setExpanded] = useState(false)
  const [maxHeight, setMaxHeight] = useState(COLLAPSED_HEIGHT)
  const [needsToggle, setNeedsToggle] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCityCounts()
      .then((cityCounts) =>
        setCities(cityCounts.map((c) => ({ city: c.city, count: c.count })))
      )
      .catch(() => {})
  }, [])

  useEffect(() => {
    const recompute = () => {
      const el = chipsRef.current
      if (!el) return
      setNeedsToggle(el.scrollHeight > COLLAPSED_HEIGHT)
      if (expanded) setMaxHeight(el.scrollHeight)
    }
    recompute()
    window.addEventListener("resize", recompute)
    return () => window.removeEventListener("resize", recompute)
  }, [cities, expanded])

  useEffect(() => {
    if (!expanded) return
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setExpanded(false)
      },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded])

  if (cities.length === 0) return null

  return (
    <section ref={sectionRef} aria-label="Popular cities" className="hidden border-y border-border bg-surface-secondary py-6 md:block">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
            <MapPin size={14} className="shrink-0 text-primary" aria-hidden="true" />
            Popular cities <span className="font-normal text-text-secondary">— jump straight to local listings</span>
          </h2>
          {needsToggle && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="popular-cities-list"
              className="flex min-h-touch items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  All cities
                </>
              )}
            </button>
          )}
        </div>
        <div
          id="popular-cities-list"
          ref={chipsRef}
          className="flex snap-x gap-2 overflow-x-auto py-1 scrollbar-hide transition-[max-height] duration-300 ease-in-out md:flex-wrap md:overflow-hidden md:snap-none"
          style={{ maxHeight: expanded ? maxHeight : COLLAPSED_HEIGHT }}
        >
          {cities.map((c) => (
            <a
              key={c.city}
              href={`/properties/${slugifyCity(c.city)}`}
              className="flex min-h-[36px] shrink-0 snap-start items-center gap-1 rounded-full border border-border bg-surface px-3.5 text-xs font-medium text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <MapPin size={12} className="shrink-0 text-primary/60" aria-hidden="true" />
              {c.city} ({c.count})
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}