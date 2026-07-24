"use client"

interface QuickSearchProps {
  cities: { city: string; _count: number }[]
}

export function QuickSearch({ cities }: QuickSearchProps) {
  if (!cities || cities.length === 0) return null
  return (
    <section className="border-y border-border bg-gray-50/50 py-6">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">Popular cities:</span>
          {cities.map((c) => (
            <a key={c.city} href={`/properties/${encodeURIComponent(c.city.toLowerCase())}`}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
              {c.city} ({c._count})
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
