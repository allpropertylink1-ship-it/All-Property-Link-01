"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BrowseFilterRail } from "./BrowseFilterRail";
import { BrowseResultsGrid } from "./BrowseResultsGrid";
import { BrowseSkeleton } from "./BrowseSkeleton";
import { FilterPanel } from "@/components/property/FilterPanel";
import { fetchCityCounts } from "@/lib/cities-client";

type PropertyFilterKey = "ALL" | "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | "LAND";
type ServiceFilterKey = "ALL" | "FUNDI" | "SERVICE_PROVIDER";

interface BrowseProperty {
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
  isFeatured: boolean;
  createdAt: string;
  hasMultipleUnits?: boolean;
  unitMixDescription?: string | null;
  units?: { price: number | string | null | undefined; listingPurpose?: string | null; bedrooms?: number | string | null }[];
}

interface BrowseService {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  pricePeriod: string;
  city: string | null;
  region: string | null;
  images: unknown;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    businessLogo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

interface ApiResponse<T> {
  properties?: T[];
  services?: T[];
  total: number;
  page: number;
  totalPages: number;
}

const PROPERTY_FILTER_MAP: Record<PropertyFilterKey, Record<string, string>> = {
  ALL: { limit: "20", includeLand: "1" },
  FOR_SALE: { purpose: "FOR_SALE", limit: "20" },
  FOR_RENT_LONG_TERM: { purpose: "FOR_RENT_LONG_TERM", limit: "20" },
  FOR_RENT_SHORT_TERM: { purpose: "FOR_RENT_SHORT_TERM", limit: "20" },
  LAND: { type: "LAND", limit: "20" },
};

const SERVICE_FILTER_MAP: Record<ServiceFilterKey, Record<string, string>> = {
  ALL: { limit: "20" },
  FUNDI: { type: "FUNDI", limit: "20" },
  SERVICE_PROVIDER: { type: "SERVICE_PROVIDER", limit: "20" },
};

// URL param to filter key mapping
const URL_TO_PROPERTY_FILTER: Record<string, PropertyFilterKey> = {
  "FOR_SALE": "FOR_SALE",
  "FOR_RENT_LONG_TERM": "FOR_RENT_LONG_TERM",
  "FOR_RENT_SHORT_TERM": "FOR_RENT_SHORT_TERM",
  "LAND": "LAND",
  "sale": "FOR_SALE",
  "rent": "FOR_RENT_LONG_TERM",
  "short-term": "FOR_RENT_SHORT_TERM",
  "land": "LAND",
};

const URL_TO_SERVICE_FILTER: Record<string, ServiceFilterKey> = {
  "FUNDI": "FUNDI",
  "SERVICE_PROVIDER": "SERVICE_PROVIDER",
  "fundi": "FUNDI",
  "service_provider": "SERVICE_PROVIDER",
};

export default function BrowsePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"properties" | "services">("properties");
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilterKey>("ALL");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilterKey>("ALL");
  const [properties, setProperties] = useState<BrowseProperty[]>([]);
  const [services, setServices] = useState<BrowseService[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(() => Math.max(1, parseInt(searchParams.get("page") || "1")));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- search state (integrated with category filter) ---
  const searchParam = searchParams.get("search") ?? searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(searchParam);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [counties, setCounties] = useState<{ city: string; count: number }[]>([]);

  useEffect(() => {
    fetchCityCounts()
      .then((cityCounts) =>
        setCounties((cityCounts || []).map((c) => ({ city: c.city, count: c.count })))
      )
      .catch(() => setCounties([]));
  }, []);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("search", trimmed);
        params.delete("q");
      } else {
        params.delete("search");
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => pushSearch(value), 350);
  };

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    pushSearch("");
  }, [pushSearch]);

  // Read URL params and set initial filters
  const syncFiltersFromUrl = useCallback(() => {
    const tab = searchParams.get("tab") as "properties" | "services" | null;
    const purpose = searchParams.get("purpose");
    const type = searchParams.get("type");
    const serviceType = searchParams.get("serviceType");
    const filter = searchParams.get("filter"); // legacy filter param

    if (tab && (tab === "properties" || tab === "services")) {
      setActiveTab(tab);
    }

    // Determine property filter from URL params
    let detectedPropertyFilter: PropertyFilterKey = "ALL";
    if (purpose && URL_TO_PROPERTY_FILTER[purpose]) {
      detectedPropertyFilter = URL_TO_PROPERTY_FILTER[purpose];
    } else if (type && URL_TO_PROPERTY_FILTER[type]) {
      detectedPropertyFilter = URL_TO_PROPERTY_FILTER[type];
    } else if (filter && URL_TO_PROPERTY_FILTER[filter]) {
      detectedPropertyFilter = URL_TO_PROPERTY_FILTER[filter];
    }
    setPropertyFilter(detectedPropertyFilter);

    // Determine service filter from URL params
    let detectedServiceFilter: ServiceFilterKey = "ALL";
    if (serviceType && URL_TO_SERVICE_FILTER[serviceType]) {
      detectedServiceFilter = URL_TO_SERVICE_FILTER[serviceType];
    } else if (filter && URL_TO_SERVICE_FILTER[filter]) {
      detectedServiceFilter = URL_TO_SERVICE_FILTER[filter];
    }
    setServiceFilter(detectedServiceFilter);

    const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1"));
    setPage(pageParam);
  }, [searchParams]);

  useEffect(() => {
    syncFiltersFromUrl();
  }, [syncFiltersFromUrl]);

  const updateUrl = useCallback(
    (tab: "properties" | "services", filter: PropertyFilterKey | ServiceFilterKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      
      if (tab === "properties") {
        params.delete("serviceType");
        params.delete("filter");
        if (filter === "LAND") {
          params.set("type", "LAND");
        } else if (filter !== "ALL") {
          params.set("purpose", filter);
        } else {
          params.delete("purpose");
          params.delete("type");
        }
      } else {
        params.delete("purpose");
        params.delete("type");
        params.delete("filter");
        if (filter !== "ALL") {
          params.set("serviceType", filter);
        } else {
          params.delete("serviceType");
        }
      }
      
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const fetchResults = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Base filters from tab/filter pills
      if (activeTab === "properties") {
        const baseParams = PROPERTY_FILTER_MAP[propertyFilter];
        Object.entries(baseParams).forEach(([k, v]) => params.set(k, v));
      } else {
        const baseParams = SERVICE_FILTER_MAP[serviceFilter];
        Object.entries(baseParams).forEach(([k, v]) => params.set(k, v));
      }

      // Additional filters from URL (use .get() — searchParams is URLSearchParams)
      if (searchParams.get("city")) params.set("city", searchParams.get("city")!);
      if (searchParams.get("minPrice")) params.set("minPrice", searchParams.get("minPrice")!);
      if (searchParams.get("maxPrice")) params.set("maxPrice", searchParams.get("maxPrice")!);
      if (searchParams.get("propertyType")) params.set("type", searchParams.get("propertyType")!);
      if (searchParams.get("category")) params.set("category", searchParams.get("category")!);
      if (searchParams.get("bedrooms")) params.set("bedrooms", searchParams.get("bedrooms")!);
      // Search integrates alongside category/type filters (AND)
      const searchVal = searchParams.get("search") || searchParams.get("q");
      if (searchVal) params.set("search", searchVal);
      if (page > 1) params.set("page", String(page));
      // Sort mapping: UI "newest"/"popular" -> backend "createdAt"/"viewCount"
      const rawSort = searchParams.get("sort");
      if (rawSort === "price-asc") { params.set("sort", "price"); params.set("order", "asc"); }
      else if (rawSort === "price-desc") { params.set("sort", "price"); params.set("order", "desc"); }
      else if (rawSort === "popular") { params.set("sort", "viewCount"); params.set("order", "desc"); }
      else if (rawSort) { params.set("sort", rawSort); }
      params.set("limit", "20");

      const endpoint = activeTab === "properties" ? "/api/properties" : "/api/services";

      const response = await fetch(`${endpoint}?${params.toString()}`, { signal });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiResponse<BrowseProperty | BrowseService> = await response.json();

      if (activeTab === "properties") {
        setProperties((data.properties as BrowseProperty[]) || []);
        setServices([]);
      } else {
        setServices((data.services as BrowseService[]) || []);
        setProperties([]);
      }
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [activeTab, propertyFilter, serviceFilter, searchParams, page]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchResults]);

  const handlePropertyFilterChange = (key: string) => {
    const newFilter = key as PropertyFilterKey;
    setPropertyFilter(newFilter);
    updateUrl("properties", newFilter);
  };

  const handleServiceFilterChange = (key: string) => {
    const newFilter = key as ServiceFilterKey;
    setServiceFilter(newFilter);
    updateUrl("services", newFilter);
  };

  const handleTabChange = (tab: "properties" | "services") => {
    setActiveTab(tab);
    const filter = tab === "properties" ? propertyFilter : serviceFilter;
    updateUrl(tab, filter);
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleFilterRemove = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // search/q share the same logical filter — remove both
    if (key === "search" || key === "q") {
      params.delete("search");
      params.delete("q");
    } else {
      params.delete(key);
    }
    // price chip removes both min/max
    if (key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    }
    if (key === "purpose") {
      params.delete("purpose");
      params.delete("type");
      params.delete("filter");
    }
    if (key === "type") {
      params.delete("type");
      params.delete("serviceType");
      params.delete("filter");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Rail-controlled values (read from URL so back/forward + shareable links keep working)
  const selectedCity = searchParams.get("city") ?? "";
  const assetType = searchParams.get("propertyType") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const bedrooms = searchParams.get("bedrooms") ?? "";

  const hotspots = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const buildHref = (city: string) => {
      const p = new URLSearchParams(params.toString());
      if (city) p.set("city", city);
      else p.delete("city");
      p.delete("page");
      const qs = p.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    };
    const top = [...counties].sort((a, b) => b.count - a.count).slice(0, 5);
    return [
      { label: "All Hubs", href: buildHref(""), active: !selectedCity },
      ...top.map((c) => ({ label: c.city, href: buildHref(c.city), active: selectedCity === c.city })),
    ];
  }, [counties, selectedCity, searchParams, pathname]);

  const handleRailReset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("q");
    params.delete("city");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("propertyType");
    params.delete("bedrooms");
    params.delete("purpose");
    params.delete("type");
    params.delete("filter");
    params.delete("category");
    params.set("page", "1");
    handleSearchClear();
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    if (activeTab === "properties") setPropertyFilter("ALL");
    else setServiceFilter("ALL");
  }, [searchParams, router, pathname, activeTab, handleSearchClear]);

  const searchPlaceholder =
    activeTab === "properties"
      ? "Locality, Estate, or Project..."
      : "Search fundis & services by title or description…";

  return (
    <div className="mx-auto max-w-content px-4 py-6">
      <div className="mb-6">
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">Browse All Listings</h1>
        <p className="mt-1 text-sm text-text-secondary">Explore everything available on All Property Link</p>
      </div>

      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          type="button"
          onClick={() => handleTabChange("properties")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "properties"
              ? "text-primary-700"
              : "text-text-secondary hover:text-text-primary"
          }`}
          aria-pressed={activeTab === "properties"}
        >
          Properties
          {activeTab === "properties" && (
            <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 h-1 w-2/3 rounded-full bg-primary-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("services")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "services"
              ? "text-primary-700"
              : "text-text-secondary hover:text-text-primary"
          }`}
          aria-pressed={activeTab === "services"}
        >
          Services
          {activeTab === "services" && (
            <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 h-1 w-2/3 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <FilterPanel>
            <BrowseFilterRail
              activeTab={activeTab}
              searchInput={searchInput}
              searchPlaceholder={searchPlaceholder}
              onSearchChange={handleSearchChange}
              onSearchClear={handleSearchClear}
              counties={counties}
              selectedCity={selectedCity}
              onCityChange={(v) => {
                if (v) handleFilterChange("city", v);
                else handleFilterRemove("city");
              }}
              propertyFilter={propertyFilter}
              onPropertyFilterChange={handlePropertyFilterChange}
              serviceFilter={serviceFilter}
              onServiceFilterChange={handleServiceFilterChange}
              assetType={assetType}
              onAssetChange={(v) => {
                if (v) handleFilterChange("propertyType", v);
                else handleFilterRemove("propertyType");
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(key, v) => {
                if (v) handleFilterChange(key, v);
                else handleFilterRemove(key);
              }}
              bedrooms={bedrooms}
              onBedroomsChange={(v) => {
                if (v) handleFilterChange("bedrooms", v);
                else handleFilterRemove("bedrooms");
              }}
              hotspots={hotspots}
              resultCount={total}
              onReset={handleRailReset}
              onApply={() => {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                pushSearch(searchInput);
                document.getElementById("browse-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </FilterPanel>
        </div>

        <main id="browse-results" className="flex scroll-mt-24 flex-col gap-6 lg:col-span-8 xl:col-span-9">

      {loading ? (
        <BrowseSkeleton count={8} />
      ) : error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 p-8 text-center">
          <p className="text-error-600">Failed to load listings. Please try again.</p>
          <button
            type="button"
            onClick={fetchResults}
            className="mt-4 touch-target rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <BrowseResultsGrid
          activeTab={activeTab}
          propertyFilter={propertyFilter}
          serviceFilter={serviceFilter}
          properties={properties}
          services={services}
          total={total}
          totalPages={totalPages}
          page={page}
          searchParams={Object.fromEntries(searchParams.entries())}
          _onFilterChange={handleFilterChange}
          onFilterRemove={handleFilterRemove}
        />
      )}
        </main>
      </div>
    </div>
  );
}
