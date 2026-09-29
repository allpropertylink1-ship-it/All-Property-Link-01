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

const TRANSACTION_OPTIONS: { value: BrowseTransaction; label: string }[] = [
  { value: "ALL", label: "Everything" },
  { value: "FOR_SALE", label: "Buy" },
  { value: "FOR_RENT_LONG_TERM", label: "Rent / Let" },
  { value: "FOR_RENT_SHORT_TERM", label: "Airbnb" },
  { value: "LAND", label: "Land & Plots" },
];

const SERVICE_OPTIONS = [
  { value: "ALL", label: "Everything" },
  { value: "FUNDI", label: "Fundis" },
  { value: "SERVICE_PROVIDER", label: "Providers" },
] as const;

const ASSET_OPTIONS = [
  { value: "", label: "All property types" },
  { value: "HOUSE", label: "Houses, Villas & Maisonettes" },
  { value: "APARTMENT", label: "Apartments & Duplexes" },
  { value: "COMMERCIAL", label: "Commercial Real Estate" },
] as const;

const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5"] as const;

const sectionLabel = "mb-1.5 block text-[13px] font-semibold text-text-primary";
const fieldInput =
  "w-full rounded-lg border border-border bg-surface-secondary text-[16px] text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
const pillOption = (active: boolean) =>
  `flex items-center justify-center rounded-lg px-2 text-center text-xs transition-colors ${
    active
      ? "bg-primary font-semibold text-white shadow-sm"
      : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/60 hover:text-text-primary"
  }`;

function OptionGrid({
  legend,
  ariaLabel,
  options,
  activeValue,
  onPick,
}: {
  legend: string;
  ariaLabel: string;
  options: readonly { value: string; label: string }[];
  activeValue: string;
  onPick: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className={sectionLabel}>{legend}</legend>
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={ariaLabel}>
        {options.map((o, i) => {
          const active = activeValue === o.value;
          return (
            <button
              key={o.value || "all"}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onPick(o.value)}
              className={`${i === 0 ? "col-span-2" : ""} min-h-[38px] px-2 py-1 lg:min-h-[30px] ${pillOption(active)}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

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
      className="flex flex-col gap-4 lg:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onApply?.();
      }}
    >
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="flex items-center gap-2 font-heading text-sm font-bold text-text-primary">
          <Filter size={16} aria-hidden="true" />
          Filter results
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-accent-600 hover:underline lg:min-h-[32px]"
        >
          Reset all
        </button>
      </div>

      {/* 1 — Keyword */}
      <div>
        <label htmlFor="rail-keyword" className={sectionLabel}>
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            id="rail-keyword"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className={`${fieldInput} py-2.5 pl-10 pr-10 lg:py-2`}
          />
          {searchInput ? (
            <button
              type="button"
              onClick={onSearchClear}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary lg:min-h-[32px] lg:min-w-[32px]"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* 2 — Location */}
      <div>
        <label htmlFor="rail-county" className={sectionLabel}>
          Location
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <select
            id="rail-county"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={`${fieldInput} cursor-pointer appearance-none py-2.5 pl-10 pr-3 lg:py-2`}
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
        <OptionGrid
          legend="I want to"
          ariaLabel="Transaction type"
          options={TRANSACTION_OPTIONS}
          activeValue={propertyFilter}
          onPick={onPropertyFilterChange}
        />
      ) : (
        <OptionGrid
          legend="Service type"
          ariaLabel="Service type"
          options={SERVICE_OPTIONS}
          activeValue={serviceFilter}
          onPick={(v) => onServiceFilterChange?.(v)}
        />
      )}

      {/* 4 — Asset type */}
      {isProperties && (
        <div>
          <label htmlFor="rail-asset" className={sectionLabel}>
            Property type
          </label>
          <select
            id="rail-asset"
            value={assetType}
            onChange={(e) => onAssetChange(e.target.value)}
            className={`${fieldInput} cursor-pointer px-3 py-2.5 lg:py-2`}
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
          <span className={`${sectionLabel} flex items-baseline justify-between`}>
            Price range
            <span className="text-xs font-medium text-text-secondary">KES</span>
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label htmlFor="rail-minPrice" className="mb-1 block text-xs text-text-secondary">
                Min
              </label>
              <input
                id="rail-minPrice"
                type="number"
                min={0}
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => onPriceChange("minPrice", e.target.value)}
                placeholder="No min"
                className={`${fieldInput} px-2.5 py-2.5 tabular-nums lg:py-2`}
              />
            </div>
            <div>
              <label htmlFor="rail-maxPrice" className="mb-1 block text-xs text-text-secondary">
                Max
              </label>
              <input
                id="rail-maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => onPriceChange("maxPrice", e.target.value)}
                placeholder="No max"
                className={`${fieldInput} px-2.5 py-2.5 tabular-nums lg:py-2`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6 — Bedrooms */}
      {isProperties && (
        <fieldset>
          <legend className={sectionLabel}>Bedrooms</legend>
          <div className="flex items-center gap-1" role="group" aria-label="Minimum bedrooms">
            {BEDROOM_OPTIONS.map((b) => {
              const active = bedrooms === b;
              return (
                <button
                  key={b || "any"}
                  type="button"
                  onClick={() => onBedroomsChange(b)}
                  aria-pressed={active}
                  className={`min-h-[38px] flex-1 px-1 text-xs tabular-nums lg:min-h-[30px] ${pillOption(active)}`}
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
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="rail-hotspots-label">
            {hotspots.map((h) =>
              h.active ? (
                <span
                  key={h.label}
                  aria-current="true"
                  className="inline-flex min-h-[30px] items-center whitespace-nowrap rounded-full bg-primary px-2.5 text-xs font-medium text-white shadow-sm lg:min-h-[28px]"
                >
                  {h.label}
                </span>
              ) : (
                <a
                  key={h.label}
                  href={h.href}
                  className="inline-flex min-h-[30px] items-center whitespace-nowrap rounded-full border border-border bg-surface px-2.5 text-xs font-medium text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary lg:min-h-[28px]"
                >
                  {h.label}
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* Single action */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <button
          type="submit"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 lg:min-h-[40px] lg:py-2"
        >
          Show {resultCount > 0 ? `${resultCount.toLocaleString()} ` : ""}results
        </button>
        <p className="flex items-center justify-center gap-1 text-xs text-text-secondary">
          <Shield size={14} aria-hidden="true" />
          100% Registry &amp; Escrow Protected
        </p>
      </div>
    </form>
  );
}
