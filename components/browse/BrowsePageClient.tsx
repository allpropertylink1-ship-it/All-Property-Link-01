"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterCardGroup } from "./FilterCardGroup";
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

  const syncFiltersFromUrl = useCallback(() => {
    const tab = searchParams.get("tab") as "properties" | "services" | null;
    const filter = searchParams.get("filter");

    if (tab && (tab === "properties" || tab === "services")) {
      setActiveTab(tab);
    }

    if (filter) {
      if (activeTab === "properties" || tab === "properties") {
        const validPropertyFilters: PropertyFilterKey[] = ["ALL", "FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM", "LAND"];
        if (validPropertyFilters.includes(filter as PropertyFilterKey)) {
          setPropertyFilter(filter as PropertyFilterKey);
        }
      }
      if (activeTab === "services" || tab === "services") {
        const validServiceFilters: ServiceFilterKey[] = ["ALL", "FUNDI", "SERVICE_PROVIDER"];
        if (validServiceFilters.includes(filter as ServiceFilterKey)) {
          setServiceFilter(filter as ServiceFilterKey);
        }
      }
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    syncFiltersFromUrl();
  }, [syncFiltersFromUrl]);

  const updateUrl = useCallback(
    (tab: "properties" | "services", filter: PropertyFilterKey | ServiceFilterKey) => {
      const params = new URLSearchParams();
      params.set("tab", tab);
      if (filter !== "ALL") {
        params.set("filter", filter);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
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

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary">Browse All Listings</h1>
        <p className="mt-2 text-text-secondary">Explore everything available on All Property Link</p>
      </div>

      <div className="mb-6 flex items-center gap-4 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => handleTabChange("properties")}
          className={`touch-target flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "properties"
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-text-secondary hover:bg-surface-secondary"
          }`}
          aria-pressed={activeTab === "properties"}
        >
          Properties
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("services")}
          className={`touch-target flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "services"
              ? "bg-primary-50 text-primary-700 border border-primary-200"
              : "text-text-secondary hover:bg-surface-secondary"
          }`}
          aria-pressed={activeTab === "services"}
        >
          Services
        </button>
      </div>

      <FilterCardGroup
        activeTab={activeTab}
        propertyFilter={propertyFilter}
        serviceFilter={serviceFilter}
        onPropertyFilterChange={handlePropertyFilterChange}
        onServiceFilterChange={handleServiceFilterChange}
      />

      <ActiveFilterBar
        activeTab={activeTab}
        propertyFilter={propertyFilter}
        serviceFilter={serviceFilter}
        onClear={handleClearFilter}
      />

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
          properties={properties}
          services={services}
          total={total}
        />
      )}
    </div>
  );
}