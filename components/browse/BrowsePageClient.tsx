"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterPillsGroup } from "./FilterPills";
import { ActiveFilterBar } from "./ActiveFilterBar";
import { BrowseResultsGrid } from "./BrowseResultsGrid";
import { BrowseSkeleton } from "./BrowseSkeleton";

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
  ALL: { limit: "20" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        }
      } else {
        params.delete("purpose");
        params.delete("type");
        params.delete("filter");
        if (filter !== "ALL") {
          params.set("serviceType", filter);
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
      const params = activeTab === "properties"
        ? PROPERTY_FILTER_MAP[propertyFilter]
        : SERVICE_FILTER_MAP[serviceFilter];

      const queryString = new URLSearchParams(params).toString();
      const endpoint = activeTab === "properties" ? "/api/properties" : "/api/services";

      const response = await fetch(`${endpoint}?${queryString}`, { signal });

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
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [activeTab, propertyFilter, serviceFilter]);

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

  const handleClearFilter = () => {
    if (activeTab === "properties") {
      setPropertyFilter("ALL");
      updateUrl("properties", "ALL");
    } else {
      setServiceFilter("ALL");
      updateUrl("services", "ALL");
    }
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleFilterRemove = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Determine if filter came from URL (not user interaction)
  const isFilterFromUrl = propertyFilter !== "ALL" || serviceFilter !== "ALL";
  const currentFilter = activeTab === "properties" ? propertyFilter : serviceFilter;
  const isDefaultFilter = currentFilter === "ALL";

  const filterLabels: Record<string, string> = {
    FOR_SALE: "For Sale",
    FOR_RENT_LONG_TERM: "For Rent",
    FOR_RENT_SHORT_TERM: "Short-Term",
    LAND: "Land & Plots",
    FUNDI: "Fundis",
    SERVICE_PROVIDER: "Services",
    ALL: activeTab === "properties" ? "All Properties" : "All Services",
  };

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary">Browse All Listings</h1>
        <p className="mt-2 text-text-secondary">Explore everything available on All Property Link</p>
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

      {/* Only show filter pills if no filter is active from URL, or if user wants to change filter */}
      {!isFilterFromUrl && (
        <FilterPillsGroup
          activeTab={activeTab}
          propertyFilter={propertyFilter}
          serviceFilter={serviceFilter}
          onPropertyFilterChange={handlePropertyFilterChange}
          onServiceFilterChange={handleServiceFilterChange}
        />
      )}

      {/* Show active filter indicator when filter is applied (from URL or user) */}
      {!isDefaultFilter && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3" role="status" aria-live="polite">
          <span className="text-sm font-medium text-primary-700">
            Showing: <strong>{filterLabels[currentFilter] || currentFilter}</strong>
          </span>
          <button
            type="button"
            onClick={handleClearFilter}
            className="ml-auto touch-target flex h-8 w-8 items-center justify-center rounded-md text-primary-600 hover:bg-primary-100 transition-colors"
            aria-label="Clear filter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}

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
          searchParams={Object.fromEntries(searchParams.entries())}
          _onFilterChange={handleFilterChange}
          onFilterRemove={handleFilterRemove}
        />
      )}
    </div>
  );
}