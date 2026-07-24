import Link from "next/link";
import Image from "next/image";
import { getServiceListings, getServiceCategories } from "@/lib/services/service";
import type { ServiceCategory, ServiceListingCard } from "@/lib/services/service";
import { Search, MapPin, Briefcase } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const revalidate = 60;

interface Props {
  searchParams: { [key: string]: string | undefined };
}

export default async function ServicesPage({ searchParams }: Props) {
  const { category, city, search, page, type } = searchParams;
  const [data, categories] = await Promise.all([
    getServiceListings({ category, city, search, page, type }),
    getServiceCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">
        Find Fundis &amp; Service Providers in Kenya
      </h1>

      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/services"
              className={`shrink-0 rounded-xl border px-4 py-3 text-center transition-colors ${
                !category
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
              }`}
            >
              <p className="text-sm font-medium">All</p>
            </Link>
            {categories.map((cat: ServiceCategory) => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className={`shrink-0 rounded-xl border px-4 py-3 text-center transition-colors ${
                  category === cat.slug
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-border bg-surface text-text-primary hover:bg-surface-secondary"
                }`}
              >
                {cat.icon && <span className="mb-1 block text-2xl">{cat.icon}</span>}
                <p className="text-sm font-medium">{cat.name}</p>
                {cat._count && cat._count.serviceListings > 0 && (
                  <p className="text-xs text-muted">{cat._count.serviceListings}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <Link href="/services" className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", !type ? "bg-primary-600 text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-secondary")}>All</Link>
        <Link href="/services?type=FUNDI" className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", type === "FUNDI" ? "bg-primary-600 text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-secondary")}>Fundis</Link>
        <Link href="/services?type=SERVICE_PROVIDER" className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", type === "SERVICE_PROVIDER" ? "bg-primary-600 text-white" : "bg-surface border border-border text-text-secondary hover:bg-surface-secondary")}>Service Providers</Link>
      </div>

      <div className="mb-8">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search services..."
              className="w-full rounded-lg border border-border bg-surface py-3 pl-9 pr-4 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="relative w-48">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="city"
              defaultValue={city || ""}
              placeholder="City..."
              className="w-full rounded-lg border border-border bg-surface py-3 pl-9 pr-4 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <button
            type="submit"
            className="touch-target rounded-lg bg-accent-300 px-6 py-3 text-sm font-medium text-white hover:bg-accent-400"
          >
            Search
          </button>
          {(search || city || category) && (
            <Link
              href="/services"
              className="touch-target inline-flex items-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <p className="mb-6 text-sm text-text-secondary">
        {data.total} {data.total === 1 ? "service" : "services"} found
      </p>

      {data.services.length === 0 ? (
        <div className="py-16 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-muted" />
          <p className="text-text-secondary">No services found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.services.map((service: ServiceListingCard) => {
            const rawImages = Array.isArray(service.images) ? service.images : [];
            const imageUrl = rawImages.length > 0 ? rawImages[0] : null;

            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Briefcase size={48} className="text-muted" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {service.category && (
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary-600">
                      {service.category.name}
                    </p>
                  )}
                  <h3 className="line-clamp-1 font-heading text-lg font-semibold text-text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
                    {service.user?.companyName ||
                      `${service.user?.firstName || ""} ${service.user?.lastName || ""}`.trim() ||
                      "Anonymous"}
                  </p>
                  {service.city && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                      <MapPin size={14} className="shrink-0" />
                      {service.city}
                      {service.region && `, ${service.region}`}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-text-primary">
                      {service.price != null
                        ? `KES ${Number(service.price).toLocaleString()}${service.pricePeriod !== "TOTAL" ? `/${service.pricePeriod.toLowerCase().replace("per_", "")}` : ""}`
                        : "Price on request"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            if (city) params.set("city", city);
            if (search) params.set("search", search);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/services?${params}`}
                className={`touch-target inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm ${
                  p === data.page
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-border text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
