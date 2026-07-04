import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";
import { DeleteSearchButton } from "./DeleteSearchButton";

function formatFilters(filters: Record<string, unknown>): string {
  const labels: Record<string, string> = {
    city: "City",
    propertyType: "Type",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    minBedrooms: "Bedrooms",
    maxBedrooms: "Bedrooms",
    minArea: "Min Area",
    maxArea: "Max Area",
    listingType: "Listing Type",
    status: "Status",
    furnished: "Furnished",
    keyword: "Keyword",
  };

  const parts: string[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    const label = labels[key] || key;
    parts.push(`${label}: ${value}`);
  }

  return parts.join(" | ") || "No filters";
}

export default async function SavedSearchesPage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const searches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (searches.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Saved Searches
        </h1>
        <EmptyState
          title="No saved searches"
          description="Save your search filters to get notified about new matches."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Saved Searches
      </h1>

      <div className="grid gap-4">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <h3 className="font-medium text-text-primary">{search.name}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {formatFilters(search.filters as Record<string, unknown>)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Saved on {search.createdAt.toLocaleDateString()}
              </p>
            </div>
            <DeleteSearchButton id={search.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
