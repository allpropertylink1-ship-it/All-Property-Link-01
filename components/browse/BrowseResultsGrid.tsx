"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ServiceCardCompact } from "./ServiceCardCompact";
import { ChevronDown, X } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";

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
  const imageUrl = images.length > 0
    ? `https://res.cloudinary.com/oxdzvktu/image/upload/w_600,q_auto,f_auto/${images[0]}`
    : `https://res.cloudinary.com/oxdzvktu/image/upload/w_600,q_auto,f_auto/placeholder_service`;

  return (
    <a href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <img
          src={imageUrl}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://res.cloudinary.com/oxdzvktu/image/upload/w_600,q_auto,f_auto/placeholder_service` }}
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

  // Build filter chips from active filters
  useEffect(() => {
    const chips: FilterChip[] = [];

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

  const sortedProperties = [...properties].sort((a, b) => {
    if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sort === "popular") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    return 0;
  });

  const sortedServices = [...services].sort((a, b) => {
    if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
    return 0;
  });

  const currentItems = activeTab === "properties" ? sortedProperties : sortedServices;
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
    params.delete("city");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("propertyType");
    params.delete("category");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (currentItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-10 text-center">
        <p className="text-sm text-text-secondary">No {itemType}s found for this filter.</p>
      </div>
    );
  }

  const isList = layout === "list";

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-surface/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-border mb-4">
        <div className="flex items-center gap-2" role="group" aria-label="Layout">
          <button
            onClick={() => handleLayoutChange("grid")}
            aria-pressed={layout === "grid"}
            className={`p-2 rounded-lg transition-colors ${layout === "grid" ? "bg-primary-50 text-primary-700" : "text-text-secondary hover:bg-surface-secondary"}`}
            aria-label="Grid view"
          >
            <GridIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleLayoutChange("list")}
            aria-pressed={layout === "list"}
            className={`p-2 rounded-lg transition-colors ${layout === "list" ? "bg-primary-50 text-primary-700" : "text-text-secondary hover:bg-surface-secondary"}`}
            aria-label="List view"
          >
            <ListIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-primary hover:border-primary-300 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            <span>{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-surface shadow-lg py-1 z-20">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`w-full px-3 py-2 text-sm text-left transition-colors ${sort === opt.value ? "bg-primary-50 text-primary-700" : "text-text-secondary hover:bg-surface-secondary"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filterChips.length > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 bg-surface/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border">
          <span className="text-xs font-medium text-text-secondary mr-1">Filters:</span>
          {filterChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-1 hover:text-primary-500 focus:outline-none"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAllFilters}
            className="ml-auto text-xs text-primary-600 hover:underline font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      <p className="mb-3 text-sm text-text-secondary">
        {total} {total === 1 ? itemType : `${itemType}s`} found
      </p>

      {isList ? (
        <div className="space-y-2" role="list" aria-label={`${itemType} list`}>
          {activeTab === "properties" ? (
            sortedProperties.map((item) => (
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
                isFeatured={item.isFeatured}
                variant="compact"
              />
            ))
          ) : (
            sortedServices.map((item) => (
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
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" role="list" aria-label={`${itemType} grid`}>
          {activeTab === "properties" ? (
            sortedProperties.map((item) => (
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
                isFeatured={item.isFeatured}
              />
            ))
          ) : (
            sortedServices.map((item) => (
              <ServiceCardGrid key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
}