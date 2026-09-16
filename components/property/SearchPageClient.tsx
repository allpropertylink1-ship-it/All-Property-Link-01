"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { AdvisoryBanner } from "@/components/browse/AdvisoryBanner";
import { BrowseSkeleton } from "@/components/browse/BrowseSkeleton";
import { HotspotPills, type Hotspot } from "@/components/browse/HotspotPills";
import {
  ResultsHeader,
  type CatalogLayout,
  type CatalogSortKey,
} from "@/components/browse/ResultsHeader";
import { SearchMatrixBar, type CountyOption } from "@/components/browse/SearchMatrixBar";
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

export default function SearchPageClient({
  q,
  city,
  propertyType,
  sortParam,
  currentPage,
}: {
  q: string;
  city?: string;
  propertyType?: string;
  sortParam?: string;
  currentPage: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<PropertiesData | null>(null);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<CatalogLayout>("grid");

  const sort: CatalogSortKey = parseCatalogSort(sortParam);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetches: Promise<unknown>[] = [];

    if (q) {
      const params = new URLSearchParams();
      params.set("search", q);
      if (city) params.set("city", city);
      if (propertyType) params.set("type", propertyType);
      const api = catalogSortToApi(sort);
      params.set("sort", api.sort);
      params.set("order", api.order);
      params.set("page", String(currentPage));
      params.set("limit", "20");
      fetches.push(
        fetch(`/api/properties?${params.toString()}`)
          .then((r) => {
            if (!r.ok) throw new Error(`API ${r.status}`);
            return r.json();
          })
          .then((d: PropertiesData) => setData(d))
          .catch((e: Error) => setError(e.message))
      );
    } else {
      setData({
        properties: [],
        total: 0,
        page: 1,
        totalPages: 0,
        cities: [],
      });
    }

    fetches.push(
      fetchCityCounts().then((cityCounts) => {
        setCities(
          (cityCounts || []).map((c) => ({
            city: c.city,
            _count: { city: c.count },
          }))
        );
      })
    );

    Promise.all(fetches).finally(() => setLoading(false));
  }, [q, city, propertyType, sort, currentPage]);

  const counties: CountyOption[] = useMemo(
    () => cities.map((c) => ({ city: c.city, count: c._count.city })),
    [cities]
  );

  const hotspots: Hotspot[] = useMemo(() => {
    const top = [...cities].sort((a, b) => b._count.city - a._count.city).slice(0, 5);
    return [
      { label: "All Hubs", href: "/properties", active: !city },
      ...top.map((c) => ({
        label: c.city,
        href: `/properties/${slugifyCity(c.city)}`,
        active: city === c.city,
      })),
    ];
  }, [cities, city]);

  const pushSort = (next: CatalogSortKey) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (propertyType) params.set("propertyType", propertyType);
    params.set("sort", next);
    if (currentPage > 1) params.set("page", String(currentPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const paginationParams: Record<string, string | undefined> = {
    q: q || undefined,
    city,
    propertyType,
    sort,
  };

  if (loading && !data) {
    return (
      <div className="bg-surface-secondary/40">
        <div className="mx-auto w-full max-w-content px-4 py-6">
          <div className="flex justify-center py-6" role="status" aria-label="Loading search results">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
          <BrowseSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary/40">
      <section aria-label="Search and filter" className="w-full bg-surface py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 xl:flex-row xl:items-center xl:justify-between">
          <SearchMatrixBar
            action="/properties/search"
            keywordName="q"
            keywordDefault={q}
            keywordPlaceholder="Search properties, cities, areas..."
            counties={counties}
            countyParamName="city"
            countyDefault={city}
            typeParamName="propertyType"
            typeDefault={propertyType}
            preserve={{ sort }}
          />
          <HotspotPills hotspots={hotspots} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-content px-4 py-6">
        <main className="flex flex-col gap-6">
          <ResultsHeader
            title={
              q
                ? `${data?.total ?? 0} ${data?.total === 1 ? "Result" : "Results"} for \u201C${q}\u201D`
                : "Search Properties Across Kenya"
            }
            subtitle={
              q
                ? "Verified houses, apartments, and land matching your search."
                : "Search by keyword, or browse listings by city below."
            }
            sort={sort}
            onSortChange={pushSort}
            layout={layout}
            onLayoutChange={setLayout}
          />

          {error ? (
            <div className="rounded-xl border border-error-200 bg-error-50 p-8 text-center" role="alert">
              <p className="font-medium text-error-600">Failed to load results: {error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            </div>
          ) : q ? (
            <>
              <PropertyGrid
                properties={data?.properties || []}
                viewToggle={layout}
                variant="full"
              />
              <Pagination
                currentPage={data?.page || currentPage}
                totalPages={data?.totalPages || 0}
                basePath="/properties/search"
                searchParams={paginationParams}
              />
            </>
          ) : (
            <div>
              <h2 className="mb-4 font-heading text-xl font-semibold text-text-primary">
                Browse by city
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {cities.map((c) => (
                  <a
                    key={c.city}
                    href={`/properties/${slugifyCity(c.city)}`}
                    className="flex min-h-[44px] min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-text-primary">{c.city}</span>
                    <span className="shrink-0 text-sm text-text-secondary">{c._count.city} properties</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <AdvisoryBanner />
        </main>
      </section>
    </div>
  );
}
