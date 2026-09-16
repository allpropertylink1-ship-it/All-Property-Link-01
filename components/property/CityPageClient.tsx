"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { FilterPanel } from "@/components/property/FilterPanel";
import { AdvisoryBanner } from "@/components/browse/AdvisoryBanner";
import { BrowseSkeleton } from "@/components/browse/BrowseSkeleton";
import { HotspotPills, type Hotspot } from "@/components/browse/HotspotPills";
import {
  ResultsHeader,
  type CatalogLayout,
  type CatalogSortKey,
} from "@/components/browse/ResultsHeader";
import { SearchMatrixBar } from "@/components/browse/SearchMatrixBar";
import { Pagination } from "@/components/shared/Pagination";
import { Loader2 } from "@/components/ui/icons";
import { slugifyCity } from "@/lib/seo";
import { fetchCityCounts } from "@/lib/cities-client";
import { catalogSortToApi, parseCatalogSort } from "./catalog-sort";

interface CityInfo {
  city: string;
  _count: { city: number };
}

interface PropertyItem {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  propertyType: string;
  listingPurpose?: string | null;
  city: string;
  region: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: unknown;
  coverImage?: string | null;
  isFeatured: boolean;
  createdAt: Date | string;
}

interface PropertiesData {
  properties: PropertyItem[];
  total: number;
  page: number;
  totalPages: number;
  cities?: { city: string; count: number }[];
}

export default function CityPageClient({
  city,
  searchParams,
}: {
  city: string;
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<PropertiesData | null>(null);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [resolvedCity, setResolvedCity] = useState(city);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<CatalogLayout>("grid");

  const { propertyType, purpose, minPrice, maxPrice, bedrooms, page, search } = searchParams;
  const sort: CatalogSortKey = parseCatalogSort(searchParams.sort);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setError(null);

    const params = new URLSearchParams();
    if (propertyType) params.set("type", propertyType);
    if (purpose) params.set("purpose", purpose);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (search) params.set("search", search);
    if (page) params.set("page", page);
    const api = catalogSortToApi(sort);
    params.set("sort", api.sort);
    params.set("order", api.order);
    params.set("limit", "20");

    fetchCityCounts()
      .then(async (cityCounts) => {
        const match = (cityCounts || []).find(
          (c) => slugifyCity(c.city) === slugifyCity(city)
        );
        if (!match) {
          setNotFound(true);
          return;
        }
        setResolvedCity(match.city);
        params.set("city", match.city);
        const propsData: PropertiesData = await fetch(`/api/properties?${params.toString()}`).then((r) => {
          if (!r.ok) throw new Error(`API ${r.status}`);
          return r.json();
        });
        setData(propsData);
        setCities(
          (cityCounts || []).map((c) => ({
            city: c.city,
            _count: { city: c.count },
          }))
        );
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [city, propertyType, purpose, minPrice, maxPrice, bedrooms, page, search, sort]);

  const hotspots: Hotspot[] = useMemo(() => {
    const top = [...cities]
      .filter((c) => slugifyCity(c.city) !== slugifyCity(resolvedCity))
      .sort((a, b) => b._count.city - a._count.city)
      .slice(0, 4);
    return [
      { label: "All Hubs", href: "/properties", active: false },
      { label: resolvedCity, href: pathname, active: true },
      ...top.map((c) => ({
        label: c.city,
        href: `/properties/${slugifyCity(c.city)}`,
        active: false,
      })),
    ];
  }, [cities, resolvedCity, pathname]);

  const pushSort = (next: CatalogSortKey) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && k !== "page") params.set(k, v);
    }
    params.set("sort", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  if (loading && !data) {
    return (
      <div className="bg-surface-secondary/40">
        <div className="mx-auto w-full max-w-content px-4 py-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="hidden lg:col-span-4 xl:col-span-3 lg:block">
              <div className="h-96 animate-pulse rounded-xl bg-surface" aria-hidden="true" />
            </div>
            <main className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
              <div className="flex items-center gap-2 rounded-xl bg-surface p-4 shadow-sm" role="status" aria-label="Loading properties">
                <Loader2 size={20} className="animate-spin text-primary-500" />
                <span className="text-sm text-text-secondary">Loading properties in {city}...</span>
              </div>
              <BrowseSkeleton count={8} />
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!loading && !data)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-text-secondary">City not found</p>
      </div>
    );
  }

  const paginationParams: Record<string, string | undefined> = { ...searchParams, sort };

  return (
    <div className="bg-surface-secondary/40">
      <section aria-label="Search and filter" className="w-full bg-surface py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 xl:flex-row xl:items-center xl:justify-between">
          <SearchMatrixBar
            action={pathname}
            keywordDefault={search}
            showCounty={false}
            fixedCounty={resolvedCity}
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
                selectedCity={resolvedCity}
                selectedType={propertyType}
                selectedPurpose={purpose}
                minPrice={minPrice}
                maxPrice={maxPrice}
                bedrooms={bedrooms}
                basePath={pathname}
                fixedCity={resolvedCity}
              />
            </FilterPanel>
          </div>

          <main className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
            <ResultsHeader
              title={`${data?.total ?? 0} Prime ${data?.total === 1 ? "Property" : "Properties"} in ${resolvedCity}`}
              subtitle={`Verified houses, apartments, and land for sale, rent, and short stays in ${resolvedCity}.`}
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
            ) : (
              <>
                <PropertyGrid
                  properties={data?.properties ?? []}
                  viewToggle={layout}
                  variant="sidebar"
                />
                <Pagination
                  currentPage={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 0}
                  basePath={pathname}
                  searchParams={paginationParams}
                />
              </>
            )}

            <AdvisoryBanner />
          </main>
        </div>
      </section>
    </div>
  );
}
