import { getProperties, getCities } from "@/lib/services/property";
import { PropertyGrid } from "@/components/property/PropertyGrid";

export const revalidate = 60;

interface Props {
  searchParams: { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const data = query
    ? await getProperties({ query, page })
    : { properties: [], total: 0, page: 1, totalPages: 0 };

  const cities = await getCities();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <form method="GET" action="/properties/search" className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search properties, cities, areas..."
            className="flex-1 rounded-lg border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            className="touch-target rounded-lg bg-primary-600 px-6 py-3 font-medium text-text-on-primary hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p className="mb-6 text-sm text-text-secondary">
          {data.total} results for &ldquo;{query}&rdquo;
        </p>
      )}

      {query ? (
        <PropertyGrid properties={data.properties} />
      ) : (
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold text-text-primary">
            Browse by city
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <a
                key={c.city}
                href={`/properties/${c.city.toLowerCase()}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-text-primary">{c.city}</span>
                <span className="text-sm text-text-secondary">{c._count.city} properties</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
