"use client";

import { ChevronDown } from "@/components/ui/icons";

export type CatalogSortKey = "newest" | "price-asc" | "price-desc" | "popular";
export type CatalogLayout = "grid" | "list";

export const CATALOG_SORT_OPTIONS: { value: CatalogSortKey; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

function GridIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

interface ResultsHeaderProps {
  title: string;
  subtitle?: string;
  liveLabel?: string;
  sort: CatalogSortKey;
  onSortChange: (sort: CatalogSortKey) => void;
  layout: CatalogLayout;
  onLayoutChange: (layout: CatalogLayout) => void;
}

export function ResultsHeader({
  title,
  subtitle,
  liveLabel = "Live Feed Verified",
  sort,
  onSortChange,
  layout,
  onLayoutChange,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success-600">
          <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
          {liveLabel}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <div className="relative flex min-h-[44px] items-center gap-2 rounded-lg bg-surface-secondary px-3">
          <label htmlFor="catalog-sort" className="text-sm font-medium text-text-secondary">
            Sort:
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as CatalogSortKey)}
            className="cursor-pointer appearance-none bg-transparent py-2 pl-1 pr-7 text-[16px] font-semibold text-text-primary focus:outline-none"
          >
            {CATALOG_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-2 text-text-secondary" />
        </div>

        <div className="flex items-center rounded-lg bg-surface-secondary p-1" role="group" aria-label="Layout">
          <button
            type="button"
            onClick={() => onLayoutChange("grid")}
            aria-pressed={layout === "grid"}
            aria-label="Grid view"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${
              layout === "grid" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("list")}
            aria-pressed={layout === "list"}
            aria-label="List view"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors ${
              layout === "list" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ListIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
