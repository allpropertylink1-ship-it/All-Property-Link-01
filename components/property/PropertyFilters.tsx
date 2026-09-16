"use client";

import { useState } from "react";
import { Filter, Shield } from "@/components/ui/icons";

interface PropertyFiltersProps {
  cities: { city: string; _count: { city: number } }[];
  selectedCity?: string;
  selectedType?: string;
  selectedPurpose?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
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
  { value: "HOUSE", label: "Houses, Villas & Maisonettes" },
  { value: "APARTMENT", label: "Apartments & Duplexes" },
  { value: "COMMERCIAL", label: "Commercial Real Estate" },
] as const;

const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5"] as const;

const sectionLabel = "mb-2 block text-sm font-semibold text-text-primary";

export function PropertyFilters({
  cities,
  selectedCity,
  selectedType,
  selectedPurpose,
  minPrice,
  maxPrice,
  bedrooms,
  basePath = "/properties",
  fixedCity,
}: PropertyFiltersProps) {
  const [purpose, setPurpose] = useState(selectedPurpose || "");
  const [type, setType] = useState(selectedType || "");
  const [beds, setBeds] = useState(bedrooms || "");

  return (
    <form method="GET" action={basePath} className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="flex items-center gap-2 font-heading text-base font-bold text-text-primary">
          <Filter size={18} />
          Refine Results
        </span>
        <a
          href={basePath}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-accent-600 hover:underline"
        >
          Reset All
        </a>
      </div>

      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="bedrooms" value={beds} />
      {fixedCity !== undefined && <input type="hidden" name="city" value={fixedCity} />}

      <fieldset>
        <legend className={sectionLabel}>Transaction Type</legend>
        <div
          className="grid grid-cols-3 gap-1 rounded-lg bg-surface-secondary p-1 text-center text-sm"
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
                className={`min-h-[44px] rounded-md px-2 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary font-bold text-white shadow-sm"
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
        <legend className={sectionLabel}>Asset Classification</legend>
        <div className="flex flex-col gap-1 text-sm" role="radiogroup" aria-label="Property type">
          {TYPE_OPTIONS.map((o) => {
            const active = type === o.value;
            return (
              <button
                key={o.value || "all"}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(o.value)}
                className={`flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-left transition-colors ${
                  active
                    ? "bg-primary-50 font-semibold text-text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    active ? "border-primary-500" : "border-border"
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </span>
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
            County &amp; Neighbourhood
          </label>
          <select
            id="filter-city"
            name="city"
            defaultValue={selectedCity || ""}
            className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Zones</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c._count.city})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Price Range (KES)</span>
          <span className="text-xs font-bold text-accent-600">Kenyan Shillings</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-minPrice" className="mb-1 block text-xs text-text-secondary">
              Min Budget
            </label>
            <input
              id="filter-minPrice"
              name="minPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={minPrice || ""}
              placeholder="No min"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label htmlFor="filter-maxPrice" className="mb-1 block text-xs text-text-secondary">
              Max Budget
            </label>
            <input
              id="filter-maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={maxPrice || ""}
              placeholder="No max"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className={sectionLabel}>Bedrooms</legend>
        <div className="flex items-center gap-1" role="group" aria-label="Minimum bedrooms">
          {BEDROOM_OPTIONS.map((b) => {
            const active = beds === b;
            return (
              <button
                key={b || "any"}
                type="button"
                onClick={() => setBeds(b)}
                aria-pressed={active}
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-1 text-sm transition-colors ${
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

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          <Filter size={16} />
          Apply Selected Filters
        </button>
        <p className="flex items-center justify-center gap-1 pt-1 text-xs text-text-secondary">
          <Shield size={14} />
          100% Registry &amp; Escrow Protected
        </p>
      </div>
    </form>
  );
}
