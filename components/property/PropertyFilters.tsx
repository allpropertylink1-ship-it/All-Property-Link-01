interface PropertyFiltersProps {
  cities: { city: string; _count: { city: number } }[];
  selectedCity?: string;
  selectedType?: string;
  selectedPurpose?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
}

export function PropertyFilters({
  cities,
  selectedCity,
  selectedType,
  selectedPurpose,
  minPrice,
  maxPrice,
  bedrooms,
}: PropertyFiltersProps) {
  return (
    <form method="GET" className="space-y-6 rounded-md border border-border bg-surface p-6">
      <div>
        <label htmlFor="city" className="mb-1 block text-sm font-medium text-text-primary">
          City
        </label>
        <select
          id="city"
          name="city"
          defaultValue={selectedCity || ""}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c._count.city})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="purpose" className="mb-1 block text-sm font-medium text-text-primary">
          Purpose
        </label>
        <select
          id="purpose"
          name="purpose"
          defaultValue={selectedPurpose || ""}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All purposes</option>
          <option value="FOR_SALE">For Sale</option>
          <option value="FOR_RENT_LONG_TERM">For Rent (long-term)</option>
          <option value="FOR_RENT_SHORT_TERM">For Rent (short-term / Airbnb)</option>
        </select>
      </div>

      <div>
        <label htmlFor="propertyType" className="mb-1 block text-sm font-medium text-text-primary">
          Type
        </label>
        <select
          id="propertyType"
          name="propertyType"
          defaultValue={selectedType || ""}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All types</option>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE">House</option>
          <option value="LAND">Land</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="minPrice" className="mb-1 block text-sm font-medium text-text-primary">
            Min price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            defaultValue={minPrice || ""}
            placeholder="0"
            className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium text-text-primary">
            Max price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            defaultValue={maxPrice || ""}
            placeholder="Any"
            className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bedrooms" className="mb-1 block text-sm font-medium text-text-primary">
          Bedrooms
        </label>
        <select
          id="bedrooms"
          name="bedrooms"
          defaultValue={bedrooms || ""}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <button
        type="submit"
        className="touch-target w-full rounded-lg bg-accent-300 px-4 py-3 text-sm font-medium text-white hover:bg-accent-400"
      >
        Apply filters
      </button>
    </form>
  );
}
