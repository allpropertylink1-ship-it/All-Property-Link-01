import { getProperties, getCities } from "@/lib/services/property";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { FilterPanel } from "@/components/property/FilterPanel";

interface Props {
  searchParams: { [key: string]: string | undefined };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const { city, propertyType, minPrice, maxPrice, bedrooms, page } = searchParams;
  const [data, cities] = await Promise.all([
    getProperties({
      city,
      propertyType,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      page: page ? Number(page) : 1,
    }),
    getCities(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">
        Properties for sale & rent in Kenya
      </h1>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterPanel>
          <PropertyFilters
            cities={cities}
            selectedCity={city}
            selectedType={propertyType}
            minPrice={minPrice}
            maxPrice={maxPrice}
            bedrooms={bedrooms}
          />
        </FilterPanel>
        <div>
          <p className="mb-4 text-sm text-text-secondary">
            {data.total} {data.total === 1 ? "property" : "properties"} found
          </p>
          <PropertyGrid properties={data.properties} />
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/properties?page=${p}${city ? `&city=${city}` : ""}${propertyType ? `&propertyType=${propertyType}` : ""}`}
                  className={`touch-target inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm ${
                    p === data.page
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-border text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
