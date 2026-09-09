"use client";

interface FilterPillProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FilterPill({ label, value, isActive, onClick, icon }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[36px] items-center gap-2 rounded-full px-4 text-sm font-medium transition-all ${
        isActive
          ? "bg-primary-500 text-white shadow-sm"
          : "border border-border bg-surface text-text-secondary hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
      }`}
      aria-pressed={isActive}
      aria-label={label}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

interface FilterPillsGroupProps {
  activeTab: "properties" | "services";
  propertyFilter: string;
  serviceFilter: string;
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
  onPropertyFilterChange,
  onServiceFilterChange,
}: FilterPillsGroupProps) {
  if (activeTab === "properties") {
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-label="Property filters">
        {PROPERTY_PILLS.map((pill) => (
          <FilterPill
            key={pill.key}
            label={pill.label}
            value={pill.key}
            isActive={propertyFilter === pill.key}
            onClick={() => onPropertyFilterChange(pill.key)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Service filters">
      {SERVICE_PILLS.map((pill) => (
        <FilterPill
          key={pill.key}
          label={pill.label}
          value={pill.key}
          isActive={serviceFilter === pill.key}
          onClick={() => onServiceFilterChange(pill.key)}
        />
      ))}
    </div>
  );
}