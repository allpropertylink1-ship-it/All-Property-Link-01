"use client";

import { useState } from "react";
import { Filter, MapPin, Search, Shield } from "@/components/ui/icons";

export interface RailHotspot {
  label: string;
  href: string;
  active: boolean;
}

interface PropertyFiltersProps {
  cities: { city: string; _count: { city: number } }[];
  selectedCity?: string;
  selectedType?: string;
  selectedPurpose?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  searchDefault?: string;
  hotspots?: RailHotspot[];
  /** Canonical path used by "Reset All", e.g. "/properties" */
  basePath?: string;
  /** When set, the county is locked (city pages): renders a hidden input instead of the select */
  fixedCity?: string;
}

const PURPOSE_TABS = [
  { value: "FOR_SALE", label: "Buy" },
  { value: "FOR_RENT_LONG_TERM", label: "Rent / Let" },
  { value: "FOR_RENT_SHORT_TERM", label: "Airbnb" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "HOUSE", label: "Houses & Villas" },
  { value: "APARTMENT", label: "Apartments" },
  { value: "COMMERCIAL", label: "Commercial" },
] as const;

const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5"] as const;

const sectionLabel = "mb-1.5 block text-[13px] font-semibold text-text-primary";
const fieldInput =
  "w-full rounded-lg border border-border bg-surface-secondary text-[16px] text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";

export function PropertyFilters({
  cities,
  selectedCity,
  selectedType,
  selectedPurpose,
  minPrice,
  maxPrice,
  bedrooms,
  searchDefault,
  hotspots = [],
  basePath = "/properties",
  fixedCity,
}: PropertyFiltersProps) {
  const [purpose, setPurpose] = useState(selectedPurpose || "");
  const [type, setType] = useState(selectedType || "");
  const [beds, setBeds] = useState(bedrooms || "");

  return (
    <form method="GET" action={basePath} className="flex flex-col gap-4 lg:gap-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="flex items-center gap-2 font-heading text-sm font-bold text-text-primary">
          <Filter size={16} />
          Refine Results
        </span>
        <a
          href={basePath}
          className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-accent-600 hover:underline lg:min-h-[32px]"
        >
          Reset All
        </a>
      </div>

      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="bedrooms" value={beds} />
      {fixedCity !== undefined && <input type="hidden" name="city" value={fixedCity} />}

      <div>
        <label htmlFor="filter-keyword" className={sectionLabel}>
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            id="filter-keyword"
            name="search"
            type="search"
            defaultValue={searchDefault || ""}
            placeholder="Locality, Estate, or Project..."
            autoComplete="off"
            className={`${fieldInput} py-2.5 pl-10 pr-3 lg:py-2`}
          />
        </div>
      </div>

      <fieldset>
        <legend className={sectionLabel}>I want to</legend>
        <div
          className="grid grid-cols-3 gap-1 rounded-lg bg-surface-secondary p-1 text-center"
          role="group"
          aria-label="Transaction type"
        >
          {PURPOSE_TABS.map((t) => {
            const active = purpose === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setPurpose(active ? "" : t.value)}
                aria-pressed={active}
                className={`min-h-[38px] rounded-md px-1 py-1 text-xs transition-colors lg:min-h-[30px] ${
                  active
                    ? "bg-primary font-semibold text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={sectionLabel}>Property type</legend>
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Property type">
          {TYPE_OPTIONS.map((o, i) => {
            const active = type === o.value;
            return (
              <button
                key={o.value || "all"}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(o.value)}
                className={`${i === 0 ? "col-span-2" : ""} min-h-[38px] px-2 py-1 text-center text-xs transition-colors lg:min-h-[30px] ${
                  active
                    ? "rounded-lg bg-primary font-semibold text-white shadow-sm"
                    : "rounded-lg bg-surface-secondary text-text-secondary hover:bg-surface-secondary/60 hover:text-text-primary"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="propertyType" value={type} />
      </fieldset>

      {fixedCity === undefined && (
        <div>
          <label htmlFor="filter-city" className={sectionLabel}>
            Location
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              aria-hidden="true"
            />
            <select
              id="filter-city"
              name="city"
              defaultValue={selectedCity || ""}
              className={`${fieldInput} cursor-pointer appearance-none py-2.5 pl-10 pr-3 lg:py-2`}
            >
              <option value="">All counties</option>
              {cities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c._count.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <span className={`${sectionLabel} flex items-baseline justify-between`}>
          Price range
          <span className="text-xs font-medium text-text-secondary">KES</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label htmlFor="filter-minPrice" className="mb-1 block text-xs text-text-secondary">
              Min
            </label>
            <input
              id="filter-minPrice"
              name="minPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={minPrice || ""}
              placeholder="No min"
              className={`${fieldInput} px-2.5 py-2.5 lg:py-2`}
            />
          </div>
          <div>
            <label htmlFor="filter-maxPrice" className="mb-1 block text-xs text-text-secondary">
              Max
            </label>
            <input
              id="filter-maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={maxPrice || ""}
              placeholder="No max"
              className={`${fieldInput} px-2.5 py-2.5 lg:py-2`}
            />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className={sectionLabel}>Bedrooms <span className="font-normal normal-case">(matches any unit)</span></legend>
        <div className="flex items-center gap-1" role="group" aria-label="Minimum bedrooms, matches any unit configuration">
          {BEDROOM_OPTIONS.map((b) => {
            const active = beds === b;
            return (
              <button
                key={b || "any"}
                type="button"
                onClick={() => setBeds(b)}
                aria-pressed={active}
                className={`min-h-[38px] flex-1 px-1 text-xs lg:min-h-[30px] ${
                  active
                    ? "rounded-lg bg-primary font-semibold text-white"
                    : "rounded-lg bg-surface-secondary text-text-primary hover:bg-surface-secondary/60"
                }`}
              >
                {b === "" ? "Any" : `${b}+`}
              </button>
            );
          })}
        </div>
      </fieldset>

      {hotspots.length > 0 && (
        <div>
          <span className={sectionLabel} id="filter-hotspots-label">
            Popular areas
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="filter-hotspots-label">
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

      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <button
          type="submit"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 lg:min-h-[40px] lg:py-2"
        >
          <Filter size={16} aria-hidden="true" />
          Show results
        </button>
        <p className="flex items-center justify-center gap-1 text-xs text-text-secondary">
          <Shield size={14} aria-hidden="true" />
          100% Registry &amp; Escrow Protected
        </p>
      </div>
    </form>
  );
}
