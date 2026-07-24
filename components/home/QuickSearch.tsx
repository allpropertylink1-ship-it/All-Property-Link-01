"use client"

import { useEffect, useState } from "react"

interface CityItem { city: string; count: number }

export function QuickSearch() {
  const [cities, setCities] = useState<CityItem[]>([])

  useEffect(() => {
    fetch("/api/properties?limit=6")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { cities?: { city: string; count: number }[] }) => setCities(data?.cities?.map(c => ({ city: c.city, count: c.count })) || []))
      .catch(() => {})
  }, [])

  if (cities.length === 0) return null

  return (
    <section className="border-y border-border bg-gray-50/50 py-6">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">Popular cities:</span>
          {cities.map((c) => (
            <a key={c.city} href={`/properties/${encodeURIComponent(c.city.toLowerCase())}`}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
              {c.city} ({c.count})
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
