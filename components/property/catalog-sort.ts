import type { CatalogSortKey } from "@/components/browse/ResultsHeader";

export function parseCatalogSort(value?: string): CatalogSortKey {
  if (value === "price-asc" || value === "price-desc" || value === "popular" || value === "newest") {
    return value;
  }
  return "newest";
}

export function catalogSortToApi(sort: CatalogSortKey): { sort: string; order: string } {
  switch (sort) {
    case "price-asc":
      return { sort: "price", order: "asc" };
    case "price-desc":
      return { sort: "price", order: "desc" };
    case "popular":
      return { sort: "viewCount", order: "desc" };
    case "newest":
    default:
      return { sort: "createdAt", order: "desc" };
  }
}
