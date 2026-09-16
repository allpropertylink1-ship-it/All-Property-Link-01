"use client";

import { MapPin, Search, SlidersHorizontal } from "@/components/ui/icons";

export interface CountyOption {
  city: string;
  count: number;
}

interface SearchMatrixBarProps {
  /** GET form target, e.g. "/properties" */
  action: string;
  keywordName?: string;
  keywordDefault?: string;
  keywordPlaceholder?: string;
  counties?: CountyOption[];
  countyParamName?: string;
  countyDefault?: string;
  /** Hide the county select entirely */
  showCounty?: boolean;
  /** Lock county to a fixed value (city pages) — renders a hidden input */
  fixedCounty?: string;
  typeParamName?: string;
  typeDefault?: string;
  typeOptions?: { value: string; label: string }[];
  /** Extra active filters to preserve across matrix submits (purpose, sort, bedrooms, ...) */
  preserve?: Record<string, string | undefined>;
  submitLabel?: string;
}

const DEFAULT_TYPE_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "HOUSE", label: "Houses & Villas" },
  { value: "APARTMENT", label: "Apartments" },
  { value: "LAND", label: "Land & Prime Plots" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const inputClass =
  "w-full bg-transparent text-[16px] text-text-primary placeholder:text-text-secondary focus:outline-none";

export function SearchMatrixBar({
  action,
  keywordName = "search",
  keywordDefault = "",
  keywordPlaceholder = "Locality, Estate, or Project...",
  counties = [],
  countyParamName = "city",
  countyDefault = "",
  showCounty = true,
  fixedCounty,
  typeParamName = "propertyType",
  typeDefault = "",
  typeOptions = DEFAULT_TYPE_OPTIONS,
  preserve = {},
  submitLabel = "Update Feed",
}: SearchMatrixBarProps) {
  return (
    <form
      method="GET"
      action={action}
      role="search"
      aria-label="Filter property feed"
      className="grid flex-1 grid-cols-1 items-center gap-2 rounded-xl bg-surface-secondary p-2 md:grid-cols-4"
    >
      {fixedCounty !== undefined && (
        <input type="hidden" name={countyParamName} value={fixedCounty} />
      )}
      {Object.entries(preserve).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null
      )}

      <div className="flex min-h-[44px] items-center gap-2 px-3 py-2">
        <Search size={18} className="shrink-0 text-text-secondary" />
        <label htmlFor="matrix-keyword" className="sr-only">
          Search by keyword
        </label>
        <input
          id="matrix-keyword"
          name={keywordName}
          type="search"
          defaultValue={keywordDefault}
          placeholder={keywordPlaceholder}
          autoComplete="off"
          className={inputClass}
        />
      </div>

      {showCounty && fixedCounty === undefined && (
        <div className="flex min-h-[44px] items-center gap-2 px-3 py-2">
          <MapPin size={18} className="shrink-0 text-text-secondary" />
          <label htmlFor="matrix-county" className="sr-only">
            Filter by county
          </label>
          <select
            id="matrix-county"
            name={countyParamName}
            defaultValue={countyDefault}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">All Counties</option>
            {counties.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.count})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex min-h-[44px] items-center gap-2 px-3 py-2">
        <SlidersHorizontal size={18} className="shrink-0 text-text-secondary" />
        <label htmlFor="matrix-type" className="sr-only">
          Filter by category
        </label>
        <select
          id="matrix-type"
          name={typeParamName}
          defaultValue={typeDefault}
          className={`${inputClass} cursor-pointer`}
        >
          {typeOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
      >
        <SlidersHorizontal size={18} />
        <span>{submitLabel}</span>
      </button>
    </form>
  );
}
