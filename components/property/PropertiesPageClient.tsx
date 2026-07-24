"use client"

import { useEffect, useState } from "react"
import { PropertyGrid } from "./PropertyGrid"
import { PropertyFilters } from "./PropertyFilters"
import { FilterPanel } from "./FilterPanel"

interface Prop {
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

export function PropertiesPageClient({ searchParams }: Props) {
  const [data, setData] = useState<{ properties: Prop[]; total: number; page: number; totalPages: number } | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [error, setError] = useState<string | null>(null)

  const { city, propertyType, purpose, page } = searchParams

  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (propertyType) params.set("type", propertyType)
    if (purpose) params.set("purpose", purpose)
    if (page) params.set("page", page)
    params.set("limit", "20")

    Promise.all([
      fetch(`/api/properties?${params}`).then(r => { if (!r.ok) throw new Error(`API ${r.status}`); return r.json() }),
      fetch("/api/properties?limit=1").then(r => { if (!r.ok) throw new Error(`API ${r.status}`); return r.json() }),
    ]).then(([propData, cityData]) => {
      setData(propData)
      setCities((cityData?.cities || []).map((c: { city: string; count: number }) => ({ city: c.city, _count: { city: c.count } })))
    }).catch(e => setError(e.message))
  }, [city, propertyType, purpose, page])

  if (error) return <div className="mx-auto max-w-7xl px-4 py-8"><p className="text-center text-red-600">{error}</p></div>
  if (!data) return <div className="mx-auto max-w-7xl px-4 py-8"><p className="text-center text-text-secondary">Loading properties...</p></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">
        Properties for sale & rent in Kenya
      </h1>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterPanel>
          <PropertyFilters
            cities={cities}
            selectedCity={city}
            selectedType={propertyType}
            selectedPurpose={purpose}
            minPrice={searchParams.minPrice}
            maxPrice={searchParams.maxPrice}
            bedrooms={searchParams.bedrooms}
          />
        </FilterPanel>
        <div>
          <p className="mb-4 text-sm text-text-secondary">
            {data.total} {data.total === 1 ? "property" : "properties"} found
          </p>
          <PropertyGrid properties={data.properties} />
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <a key={p}
                  href={`/properties?page=${p}${city ? `&city=${city}` : ""}${propertyType ? `&propertyType=${propertyType}` : ""}${purpose ? `&purpose=${purpose}` : ""}`}
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
