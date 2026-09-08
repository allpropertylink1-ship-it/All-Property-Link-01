"use client";

import { X } from "@/components/ui/icons";

interface ActiveFilterBarProps {
  activeTab: "properties" | "services";
  propertyFilter: string;
  serviceFilter: string;
  onClear: () => void;
}

const PROPERTY_FILTER_LABELS: Record<string, string> = {
  FOR_SALE: "For Sale",
  FOR_RENT_LONG_TERM: "For Rent",
  FOR_RENT_SHORT_TERM: "Short-Term",
  LAND: "Land & Plots",
  ALL: "All Properties",
};

const SERVICE_FILTER_LABELS: Record<string, string> = {
  FUNDI: "Fundis",
  SERVICE_PROVIDER: "Services",
  ALL: "All Services",
};

export function ActiveFilterBar({
  activeTab,
  propertyFilter,
  serviceFilter,
  onClear,
}: ActiveFilterBarProps) {
  const isDefault =
    (activeTab === "properties" && propertyFilter === "ALL") ||
    (activeTab === "services" && serviceFilter === "ALL");

  if (isDefault) return null;

  const label =
    activeTab === "properties"
      ? PROPERTY_FILTER_LABELS[propertyFilter] || propertyFilter
      : SERVICE_FILTER_LABELS[serviceFilter] || serviceFilter;

  return (
    <div
      className="mb-6 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium text-primary-700">
        Showing: <strong>{label}</strong>
      </span>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto touch-target flex h-8 w-8 items-center justify-center rounded-md text-primary-600 hover:bg-primary-100 transition-colors"
        aria-label="Clear filter"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}