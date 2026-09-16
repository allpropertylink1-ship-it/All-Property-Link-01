"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { PropertyGrid } from "./PropertyGrid"
import { PropertyFilters } from "./PropertyFilters"
import { FilterPanel } from "./FilterPanel"
import { AdvisoryBanner } from "@/components/browse/AdvisoryBanner"
import { BrowseSkeleton } from "@/components/browse/BrowseSkeleton"
import { HotspotPills, type Hotspot } from "@/components/browse/HotspotPills"
import {
  ResultsHeader,
  type CatalogLayout,
  type CatalogSortKey,
} from "@/components/browse/ResultsHeader"
import { SearchMatrixBar, type CountyOption } from "@/components/browse/SearchMatrixBar"
import { Pagination } from "@/components/shared/Pagination"
import { fetchCityCounts } from "@/lib/cities-client"
import { slugifyCity } from "@/lib/seo"
import { catalogSortToApi, parseCatalogSort } from "./catalog-sort"

interface Prop {
  id: string; slug: string; title: string; price: number | null; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; bedrooms: number | null;
  bathrooms: number | null; area: number | null; images: unknown;
  coverImage?: string | null;
  isFeatured: boolean; createdAt: Date | string;
}

interface City { city: string; _count: { city: number } }

interface Props {
  searchParams: Record<string, string | undefined>
}

export function PropertiesPageClient({ searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [data, setData] = useState<{ properties: Prop[]; total: number; page: number; totalPages: number } | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const [error, setError] = useState<string | null>(null)
  const [layout, setLayout] = useState<CatalogLayout>("grid")

  const { city, propertyType, purpose, minPrice, maxPrice, bedrooms, page, search } = searchParams
  const sort: CatalogSortKey = parseCatalogSort(searchParams.sort)

  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (propertyType) params.set("type", propertyType)
    if (purpose) params.set("purpose", purpose)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (bedrooms) params.set("bedrooms", bedrooms)
    if (search) params.set("search", search)
    if (page) params.set("page", page)
    const api = catalogSortToApi(sort)
    params.set("sort", api.sort)
    params.set("order", api.order)
    params.set("limit", "20")

    setData(null)
    setError(null)
    Promise.all([
      fetch(`/api/properties?${params}`).then(r => { if (!r.ok) throw new Error(`API ${r.status}`); return r.json() }),
      fetchCityCounts(),
    ]).then(([propData, cityCounts]) => {
      setData(propData)
      setCities((cityCounts || []).map((c: { city: string; count: number }) => ({ city: c.city, _count: { city: c.count } })))
    }).catch(e => setError(e.message))
  }, [city, propertyType, purpose, minPrice, maxPrice, bedrooms, page, search, sort])

  const counties: CountyOption[] = useMemo(
    () => cities.map((c) => ({ city: c.city, count: c._count.city })),
    [cities]
  )

  const hotspots: Hotspot[] = useMemo(() => {
    const top = [...cities].sort((a, b) => b._count.city - a._count.city).slice(0, 5)
    return [
      { label: "All Hubs", href: "/properties", active: !city },
      ...top.map((c) => ({
        label: c.city,
        href: `/properties/${slugifyCity(c.city)}`,
        active: city === c.city,
      })),
    ]
  }, [cities, city])

  const pushSort = (next: CatalogSortKey) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && k !== "page") params.set(k, v)
    }
    params.set("sort", next)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const paginationParams = useMemo(() => {
    const out: Record<string, string | undefined> = { ...searchParams }
    out.sort = sort
    return out
  }, [searchParams, sort])

  return (
    <div className="bg-surface-secondary/40">
      <section aria-label="Search and filter" className="w-full bg-surface py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 xl:flex-row xl:items-center xl:justify-between">
          <SearchMatrixBar
            action="/properties"
            keywordDefault={search}
            counties={counties}
            countyDefault={city}
            typeDefault={propertyType}
            preserve={{ purpose, sort, minPrice, maxPrice, bedrooms }}
          />
          <HotspotPills hotspots={hotspots} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-content px-4 py-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 xl:col-span-3">
            <FilterPanel>
              <PropertyFilters
                cities={cities}
                selectedCity={city}
                selectedType={propertyType}
                selectedPurpose={purpose}
                minPrice={minPrice}
                maxPrice={maxPrice}
                bedrooms={bedrooms}
                basePath="/properties"
              />
            </FilterPanel>
          </div>

          <main className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
            <ResultsHeader
              title={`${data?.total ?? "…"} Prime ${data?.total === 1 ? "Property" : "Properties"} Available`}
              subtitle="Residential sanctuaries, investment land, and serviced apartments across Kenya."
              sort={sort}
              onSortChange={pushSort}
              layout={layout}
              onLayoutChange={setLayout}
            />

            {error ? (
              <div className="rounded-xl border border-error-200 bg-error-50 p-8 text-center" role="alert">
                <p className="font-medium text-error-600">Failed to load properties: {error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white"
                >
                  Retry
                </button>
              </div>
            ) : !data ? (
              <BrowseSkeleton count={8} />
            ) : (
              <>
                <PropertyGrid properties={data.properties} viewToggle={layout} variant="sidebar" />
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  basePath="/properties"
                  searchParams={paginationParams}
                />
              </>
            )}

            <AdvisoryBanner />
          </main>
        </div>
      </section>
    </div>
  )
}
