"use client";

import { Filter, MapPin, Search, Shield, X } from "@/components/ui/icons";

export type BrowseTransaction = "ALL" | "FOR_SALE" | "FOR_RENT_LONG_TERM" | "FOR_RENT_SHORT_TERM" | "LAND";

export interface BrowseRailCounty {
  city: string;
  count: number;
}

export interface BrowseRailHotspot {
  label: string;
  href: string;
  active: boolean;
}

interface BrowseFilterRailProps {
  activeTab: "properties" | "services";
  searchInput: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  counties: BrowseRailCounty[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  propertyFilter: BrowseTransaction;
  onPropertyFilterChange: (key: string) => void;
  serviceFilter?: string;
  onServiceFilterChange?: (key: string) => void;
  assetType: string;
  onAssetChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (key: "minPrice" | "maxPrice", value: string) => void;
  bedrooms: string;
  onBedroomsChange: (value: string) => void;
  hotspots: BrowseRailHotspot[];
  resultCount: number;
  onReset: () => void;
  onApply?: () => void;
}

const TRANSACTION_OPTIONS: { value: BrowseTransaction; label: string; hint: string }[] = [
  { value: "ALL", label: "Everything", hint: "All listings" },
  { value: "FOR_SALE", label: "Buy", hint: "For sale" },
  { value: "FOR_RENT_LONG_TERM", label: "Rent / Let", hint: "Long term" },
  { value: "FOR_RENT_SHORT_TERM", label: "Airbnb", hint: "Short stays" },
  { value: "LAND", label: "Land & Plots", hint: "Prime land" },
];

const SERVICE_OPTIONS = [
  { value: "ALL", label: "Everything", hint: "All services" },
  { value: "FUNDI", label: "Fundis", hint: "Skilled trades" },
  { value: "SERVICE_PROVIDER", label: "Service Providers", hint: "Delivery & more" },
] as const;

const ASSET_OPTIONS = [
  { value: "", label: "All property types" },
  { value: "HOUSE", label: "Houses, Villas & Maisonettes" },
  { value: "APARTMENT", label: "Apartments & Duplexes" },
  { value: "COMMERCIAL", label: "Commercial Real Estate" },
] as const;

const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5"] as const;

const sectionLabel = "mb-2 block text-sm font-semibold text-text-primary";
const sectionHint = "mb-2 block text-xs text-text-secondary";

export function BrowseFilterRail({
  activeTab,
  searchInput,
  searchPlaceholder,
  onSearchChange,
  onSearchClear,
  counties,
  selectedCity,
  onCityChange,
  propertyFilter,
  onPropertyFilterChange,
  serviceFilter = "ALL",
  onServiceFilterChange,
  assetType,
  onAssetChange,
  minPrice,
  maxPrice,
  onPriceChange,
  bedrooms,
  onBedroomsChange,
  hotspots,
  resultCount,
  onReset,
  onApply,
}: BrowseFilterRailProps) {
  const isProperties = activeTab === "properties";

  return (
    <form
      role="search"
      aria-label={isProperties ? "Filter properties" : "Filter services"}
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onApply?.();
      }}
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="flex items-center gap-2 font-heading text-base font-bold text-text-primary">
          <Filter size={18} aria-hidden="true" />
          Filter results
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-accent-600 hover:underline"
        >
          Reset all
        </button>
      </div>

      {/* 1 — Keyword */}
      <div>
        <label htmlFor="rail-keyword" className={sectionLabel}>
          Search
        </label>
        <span className={sectionHint}>Name, estate, project or keyword</span>
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            id="rail-keyword"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-surface-secondary py-3 pl-11 pr-11 text-[16px] text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={onSearchClear}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* 2 — Location */}
      <div>
        <label htmlFor="rail-county" className={sectionLabel}>
          Location
        </label>
        <span className={sectionHint}>County or town</span>
        <div className="relative">
          <MapPin
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <select
            id="rail-county"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface-secondary py-3 pl-11 pr-4 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All counties</option>
            {counties.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 — Transaction (properties) / Service type (services) */}
      {isProperties ? (
        <fieldset>
          <legend className={sectionLabel}>I want to</legend>
          <span className={sectionHint}>Buy, rent, book or invest</span>
          <div className="flex flex-col gap-1" role="radiogroup" aria-label="Transaction type">
            {TRANSACTION_OPTIONS.map((o) => {
              const active = propertyFilter === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onPropertyFilterChange(o.value)}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-left transition-colors ${
                    active
                      ? "bg-primary-50 font-semibold text-text-primary ring-1 ring-inset ring-primary-200"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-primary-500" : "border-border"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                  </span>
                  <span className="text-sm">{o.label}</span>
                  <span className="ml-auto text-xs text-text-secondary">{o.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <fieldset>
          <legend className={sectionLabel}>Service type</legend>
          <span className={sectionHint}>Fundis or service providers</span>
          <div className="flex flex-col gap-1" role="radiogroup" aria-label="Service type">
            {SERVICE_OPTIONS.map((o) => {
              const active = serviceFilter === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onServiceFilterChange?.(o.value)}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-left transition-colors ${
                    active
                      ? "bg-primary-50 font-semibold text-text-primary ring-1 ring-inset ring-primary-200"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-primary-500" : "border-border"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                  </span>
                  <span className="text-sm">{o.label}</span>
                  <span className="ml-auto text-xs text-text-secondary">{o.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 4 — Asset type */}
      {isProperties && (
        <div>
          <label htmlFor="rail-asset" className={sectionLabel}>
            Property type
          </label>
          <span className={sectionHint}>House, apartment or commercial</span>
          <select
            id="rail-asset"
            value={assetType}
            onChange={(e) => onAssetChange(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-border bg-surface-secondary px-4 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {ASSET_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5 — Price */}
      {isProperties && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-text-primary">Price range</span>
            <span className="text-xs font-medium text-text-secondary">KES</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="rail-minPrice" className="mb-1 block text-xs text-text-secondary">
                Min budget
              </label>
              <input
                id="rail-minPrice"
                type="number"
                min={0}
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => onPriceChange("minPrice", e.target.value)}
                placeholder="No min"
                className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] tabular-nums text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label htmlFor="rail-maxPrice" className="mb-1 block text-xs text-text-secondary">
                Max budget
              </label>
              <input
                id="rail-maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => onPriceChange("maxPrice", e.target.value)}
                placeholder="No max"
                className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] tabular-nums text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6 — Bedrooms */}
      {isProperties && (
        <fieldset>
          <legend className={sectionLabel}>Bedrooms</legend>
          <span className={sectionHint}>Minimum bedrooms</span>
          <div className="flex items-center gap-1" role="group" aria-label="Minimum bedrooms">
            {BEDROOM_OPTIONS.map((b) => {
              const active = bedrooms === b;
              return (
                <button
                  key={b || "any"}
                  type="button"
                  onClick={() => onBedroomsChange(b)}
                  aria-pressed={active}
                  className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-1 text-sm tabular-nums transition-colors ${
                    active
                      ? "bg-primary font-bold text-white"
                      : "bg-surface-secondary text-text-primary hover:bg-surface-secondary/70"
                  }`}
                >
                  {b === "" ? "Any" : `${b}+`}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* 7 — Popular areas */}
      {hotspots.length > 0 && (
        <div>
          <span className={sectionLabel} id="rail-hotspots-label">
            Popular areas
          </span>
          <span className={sectionHint}>Jump to a hotspot hub</span>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="rail-hotspots-label">
            {hotspots.map((h) =>
              h.active ? (
                <span
                  key={h.label}
                  aria-current="true"
                  className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-medium text-white shadow-sm"
                >
                  {h.label}
                </span>
              ) : (
                <a
                  key={h.label}
                  href={h.href}
                  className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {h.label}
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* Single action */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <button
          type="submit"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          Show {resultCount > 0 ? `${resultCount.toLocaleString()} ` : ""}results
        </button>
        <p className="flex items-center justify-center gap-1 pt-1 text-xs text-text-secondary">
          <Shield size={14} aria-hidden="true" />
          100% Registry &amp; Escrow Protected
        </p>
      </div>
    </form>
  );
}
