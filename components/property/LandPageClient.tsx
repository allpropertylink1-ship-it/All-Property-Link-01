"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PropertyGrid } from "./PropertyGrid"
import { LandFilters } from "./LandFilters"
import { FilterPanel } from "./FilterPanel"
import { fetchCityCounts } from "@/lib/cities-client"

interface LandPlot {
  id: string; slug: string; title: string; price: number; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; bedrooms: number | null;
  bathrooms: number | null; area: number | null; images: unknown;
  isFeatured: boolean; createdAt: Date;
}

interface City { city: string; _count: { city: number } }

interface Props {
  searchParams: Record<string, string | undefined>
}

export function LandPageClient({ searchParams }: Props) {
  const [data, setData] = useState<{ properties: LandPlot[]; total: number; page: number; totalPages: number } | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [error, setError] = useState<string | null>(null)

  const { city, search, minPrice, maxPrice, page } = searchParams

  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    params.set("type", "LAND")
    if (search) params.set("search", search)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (page) params.set("page", page)
    params.set("limit", "20")

    Promise.all([
      fetch(`/api/properties?${params}`).then(r => { if (!r.ok) throw new Error(`API ${r.status}`); return r.json() }),
      fetchCityCounts("LAND"),
    ]).then(([propData, cityCounts]) => {
      setData(propData)
      setCities((cityCounts || []).map((c: { city: string; count: number }) => ({ city: c.city, _count: { city: c.count } })))
    }).catch(e => setError(e.message))
  }, [city, search, minPrice, maxPrice, page])

  if (error) return <div className="mx-auto max-w-7xl px-4 py-8"><p className="text-center text-red-600">{error}</p></div>
  if (!data) return <div className="mx-auto max-w-7xl px-4 py-8"><p className="text-center text-text-secondary">Loading land & plots...</p></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
        Land & plots for sale in Kenya
      </h1>
      <p className="mb-8 text-text-secondary">
        Residential plots, farmland and commercial land from verified sellers.
        Looking for houses or rentals?{" "}
        <Link href="/properties" className="font-medium text-primary-600 hover:underline">
          Browse properties
        </Link>
      </p>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterPanel>
          <LandFilters
            cities={cities}
            selectedCity={city}
            minPrice={searchParams.minPrice}
            maxPrice={searchParams.maxPrice}
          />
        </FilterPanel>
        <div>
          <p className="mb-4 text-sm text-text-secondary">
            {data.total} {data.total === 1 ? "plot" : "plots"} found
          </p>
          <PropertyGrid properties={data.properties} />
          {data.totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <a key={p}
                  href={`/land?page=${p}${city ? `&city=${city}` : ""}${search ? `&search=${search}` : ""}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`}
                  className={`touch-target inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm ${p === data.page ? "border-primary-600 bg-primary-600 text-white" : "border-border text-text-secondary hover:bg-surface-secondary"}`}>
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
