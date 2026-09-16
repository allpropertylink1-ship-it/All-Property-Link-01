"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ServiceCardCompact } from "./ServiceCardCompact";
import { ChevronDown, X } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";

function GridIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";
type LayoutOption = "grid" | "list";

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
  coverImage?: string | null;
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

interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface BrowseResultsGridProps {
  activeTab: "properties" | "services";
  propertyFilter: string;
  serviceFilter: string;
  properties: BrowseProperty[];
  services: BrowseService[];
  total: number;
  totalPages: number;
  page: number;
  searchParams: Record<string, string | undefined>;
  _onFilterChange?: (key: string, value: string) => void;
  onFilterRemove: (key: string) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

function ServiceCardGrid({ item }: { item: BrowseService }) {
  const images = Array.isArray(item.images) ? item.images : [];
  let imageUrl = ""
  if (images.length > 0) {
    const raw = String(images[0])
    if (raw.startsWith("/uploads/")) imageUrl = raw
    else if (raw) imageUrl = raw
  }
  const fallback = "/placeholder-service.jpg"

  return (
    <a href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <img
          src={imageUrl || fallback}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = fallback }}
        />
        {item.category && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-primary-500 px-2.5 py-1 text-xs font-semibold text-white">
            {item.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
        <p className="mt-1 text-xs text-text-secondary">{item.city || item.region || "Kenya"}</p>
        {item.price != null && (
          <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price), item.pricePeriod)}</p>
        )}
        {item.user && (
          <p className="mt-1 text-xs text-text-secondary">{item.user.firstName} {item.user.lastName}</p>
        )}
      </div>
    </a>
  );
}

export function BrowseResultsGrid({
  activeTab,
  propertyFilter,
  serviceFilter,
  properties,
  services,
  total,
  totalPages,
  page,
  searchParams,
  _onFilterChange,
  onFilterRemove,
}: BrowseResultsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [layout, setLayout] = useState<LayoutOption>(() => (sp.get("view") as LayoutOption) || "grid");
  const [sort, setSort] = useState<SortOption>(() => (sp.get("sort") as SortOption) || "newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterChips, setFilterChips] = useState<FilterChip[]>([]);

  // Build filter chips from active filters (including search — integrated with category)
  useEffect(() => {
    const chips: FilterChip[] = [];

    const searchVal = (searchParams.search as string | undefined) ?? (searchParams.q as string | undefined);
    if (searchVal) {
      const label = searchVal.length > 28 ? `${searchVal.slice(0, 28)}…` : searchVal;
      chips.push({ key: "search", label: `“${label}”`, onRemove: () => onFilterRemove("search") });
    }

    if (activeTab === "properties") {
      if (propertyFilter !== "ALL") {
        const labels: Record<string, string> = {
          FOR_SALE: "For Sale",
          FOR_RENT_LONG_TERM: "For Rent",
          FOR_RENT_SHORT_TERM: "Short-Term",
          LAND: "Land & Plots",
        };
        chips.push({ key: "purpose", label: labels[propertyFilter] || propertyFilter, onRemove: () => onFilterRemove("purpose") });
      }
      if (searchParams.city) {
        chips.push({ key: "city", label: searchParams.city, onRemove: () => onFilterRemove("city") });
      }
      if (searchParams.minPrice || searchParams.maxPrice) {
        const min = searchParams.minPrice ? `KES ${Number(searchParams.minPrice).toLocaleString()}` : "Any";
        const max = searchParams.maxPrice ? `KES ${Number(searchParams.maxPrice).toLocaleString()}` : "Any";
        chips.push({ key: "price", label: `${min} - ${max}`, onRemove: () => { onFilterRemove("minPrice"); onFilterRemove("maxPrice"); } });
      }
      if (searchParams.propertyType) {
        chips.push({ key: "propertyType", label: searchParams.propertyType, onRemove: () => onFilterRemove("propertyType") });
      }
    } else {
      if (serviceFilter !== "ALL") {
        const labels: Record<string, string> = {
          FUNDI: "Fundis",
          SERVICE_PROVIDER: "Services",
        };
        chips.push({ key: "type", label: labels[serviceFilter] || serviceFilter, onRemove: () => onFilterRemove("type") });
      }
      if (searchParams.category) {
        chips.push({ key: "category", label: searchParams.category, onRemove: () => onFilterRemove("category") });
      }
      if (searchParams.city) {
        chips.push({ key: "city", label: searchParams.city, onRemove: () => onFilterRemove("city") });
      }
    }

    setFilterChips(chips);
  }, [activeTab, propertyFilter, serviceFilter, searchParams, onFilterRemove]);

  // Server-side sorting now (browse sends sort/order to API); no in-memory sort.
  const currentItems = activeTab === "properties" ? properties : services;
  const itemType = activeTab === "properties" ? "property" : "service";

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLayoutChange = (newLayout: LayoutOption) => {
    setLayout(newLayout);
    updateUrl({ view: newLayout });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    updateUrl({ sort: newSort });
    setSortOpen(false);
  };

  const handleClearAllFilters = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("filter");
    params.delete("purpose");
    params.delete("type");
    params.delete("serviceType");
    params.delete("city");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("propertyType");
    params.delete("category");
    params.delete("search");
    params.delete("q");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const searchVal = (searchParams.search as string | undefined) ?? (searchParams.q as string | undefined);
  const activeFilterLabel =
    activeTab === "properties"
      ? ({ FOR_SALE: "For Sale", FOR_RENT_LONG_TERM: "For Rent", FOR_RENT_SHORT_TERM: "Short-Term", LAND: "Land & Plots" } as Record<string, string>)[propertyFilter] ?? propertyFilter
      : ({ FUNDI: "Fundis", SERVICE_PROVIDER: "Services" } as Record<string, string>)[serviceFilter] ?? serviceFilter;
  const hasCategory = activeTab === "properties" ? propertyFilter !== "ALL" : serviceFilter !== "ALL";

  if (currentItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-10 text-center">
        <p className="text-sm font-medium text-text-primary">
          No {itemType}s found{searchVal ? ` for “${searchVal}”` : ""}{hasCategory ? ` in ${activeFilterLabel}` : ""}.
        </p>
        <p className="mt-1 text-sm text-text-secondary">Try adjusting your search or filter.</p>
        {(searchVal || hasCategory) && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="mt-4 touch-target rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
          >
            Clear search & filters
          </button>
        )}
      </div>
    );
  }

  const isList = layout === "list";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success-600">
            <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
            Live Feed Verified
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-text-primary" aria-live="polite">
            {total} {total === 1 ? itemType : `${itemType}s`} found
            {searchVal ? (
              <span className="font-medium text-text-secondary">
                {" "}
                for <span className="font-semibold text-text-primary">&ldquo;{searchVal}&rdquo;</span>
              </span>
            ) : null}
            {hasCategory ? <span className="font-medium text-text-secondary"> in {activeFilterLabel}</span> : null}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center rounded-lg bg-surface-secondary p-1" role="group" aria-label="Layout">
            <button
              onClick={() => handleLayoutChange("grid")}
              aria-pressed={layout === "grid"}
              aria-label="Grid view"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${layout === "grid" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
            >
              <GridIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleLayoutChange("list")}
              aria-pressed={layout === "list"}
              aria-label="List view"
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${layout === "list" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-surface-secondary px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary/70"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <span>Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${sort === opt.value ? "bg-primary-50 font-semibold text-text-primary" : "text-text-secondary hover:bg-surface-secondary"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface px-4 py-3 shadow-sm">
          <span className="mr-1 text-xs font-medium text-text-secondary">Filters:</span>
          {filterChips.map((chip) => (
            <span key={chip.key} className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-1 flex min-h-[36px] min-w-[36px] items-center justify-center hover:text-primary-500 focus:outline-none"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAllFilters}
            className="ml-auto inline-flex min-h-[44px] items-center text-xs font-medium text-primary-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {isList ? (
        <div className="space-y-2" role="list" aria-label={`${itemType} list`}>
          {activeTab === "properties" ? (
            properties.map((item) => (
              <PropertyCard
                key={item.id}
                slug={item.slug}
                title={item.title}
                price={item.price}
                currency={item.currency}
                propertyType={item.propertyType}
                listingPurpose={item.listingPurpose}
                city={item.city}
                region={item.region}
                bedrooms={item.bedrooms}
                bathrooms={item.bathrooms}
                area={item.area}
                images={item.images}
                coverImage={item.coverImage ?? null}
                isFeatured={item.isFeatured}
                variant="compact"
              />
            ))
          ) : (
            services.map((item) => (
              <ServiceCardCompact
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                currency={item.currency}
                pricePeriod={item.pricePeriod}
                city={item.city}
                region={item.region}
                images={item.images}
                category={item.category}
                user={item.user}
              />
            ))
          )}
        </div>
       ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" role="list" aria-label={`${itemType} grid`}>
          {activeTab === "properties" ? (
            properties.map((item) => (
              <PropertyCard
                key={item.id}
                slug={item.slug}
                title={item.title}
                price={item.price}
                currency={item.currency}
                propertyType={item.propertyType}
                listingPurpose={item.listingPurpose}
                city={item.city}
                region={item.region}
                bedrooms={item.bedrooms}
                bathrooms={item.bathrooms}
                area={item.area}
                images={item.images}
                coverImage={item.coverImage ?? null}
                isFeatured={item.isFeatured}
              />
            ))
          ) : (
            services.map((item) => (
              <ServiceCardGrid key={item.id} item={item} />
            ))
          )}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={pathname}
        searchParams={searchParams}
        onChange={(p) => {
          const params = new URLSearchParams(sp.toString());
          if (p > 1) params.set("page", String(p));
          else params.delete("page");
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      />
    </div>
  );
}