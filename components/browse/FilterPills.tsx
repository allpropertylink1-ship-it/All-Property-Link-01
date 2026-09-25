"use client";

interface FilterPillProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
}

export function FilterPill({ label, value, isActive, onClick, count, icon }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-all ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : "border border-border bg-surface text-text-secondary hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
      }`}
      aria-pressed={isActive}
      aria-label={label}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span className={isActive ? "bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-medium" : "bg-muted/10 rounded-full px-1.5 py-0.5 text-[10px] font-medium"}>
          {count}
        </span>
      )}
    </button>
  );
}

interface FilterPillsGroupProps {
  activeTab: "properties" | "services";
  propertyFilter: string;
  serviceFilter: string;
  propertyCounts?: Record<string, number>;
  serviceCounts?: Record<string, number>;
  onPropertyFilterChange: (key: string) => void;
  onServiceFilterChange: (key: string) => void;
}

const PROPERTY_PILLS = [
  { key: "ALL", label: "All", filterType: "purpose" },
  { key: "FOR_SALE", label: "For Sale", filterType: "purpose", icon: null },
  { key: "FOR_RENT_LONG_TERM", label: "For Rent", filterType: "purpose", icon: null },
  { key: "FOR_RENT_SHORT_TERM", label: "Short-Term", filterType: "purpose", icon: null },
  { key: "LAND", label: "Land", filterType: "type", icon: null },
] as const;

const SERVICE_PILLS = [
  { key: "ALL", label: "All", filterType: "serviceType" },
  { key: "FUNDI", label: "Fundis", filterType: "serviceType", icon: null },
  { key: "SERVICE_PROVIDER", label: "Services", filterType: "serviceType", icon: null },
] as const;

export function FilterPillsGroup({
  activeTab,
  propertyFilter,
  serviceFilter,
  propertyCounts,
  serviceCounts,
  onPropertyFilterChange,
  onServiceFilterChange,
}: FilterPillsGroupProps) {
  if (activeTab === "properties") {
    return (
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Property filters">
        {PROPERTY_PILLS.map((pill) => (
          <FilterPill
            key={pill.key}
            label={pill.label}
            value={pill.key}
            isActive={propertyFilter === pill.key}
            onClick={() => onPropertyFilterChange(pill.key)}
            count={propertyCounts?.[pill.key]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Service filters">
      {SERVICE_PILLS.map((pill) => (
        <FilterPill
          key={pill.key}
          label={pill.label}
          value={pill.key}
          isActive={serviceFilter === pill.key}
          onClick={() => onServiceFilterChange(pill.key)}
          count={serviceCounts?.[pill.key]}
        />
      ))}
    </div>
  );
}