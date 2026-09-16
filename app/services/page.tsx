import Link from "next/link";
import { getServiceListings, getServiceCategories } from "@/lib/services/service";
import type { ServiceCategory, ServiceListingCard } from "@/lib/services/service";
import { Search, MapPin, Shield, Clock, Briefcase, ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/lib/seo";
import { ServiceCardCompact } from "@/components/browse/ServiceCardCompact";

export const revalidate = 60;

export const metadata = {
  title: "Services & Fundis in Kenya",
  description:
    "Find trusted fundis and service providers in Kenya — plumbing, electrical, carpentry, cleaning, security, property management and more.",
  alternates: { canonical: "/services" },
};

interface Props {
  searchParams: { [key: string]: string | undefined };
}

export default async function ServicesPage({ searchParams }: Props) {
  const { category, city, search, page, type } = searchParams;
  const [data, categories] = await Promise.all([
    getServiceListings({ category, city, search, page, type }),
    getServiceCategories(),
  ]);

  const hasFilters = Boolean(search || city || category || type);

  const typeHref = (value?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (search) params.set("search", search);
    if (value) params.set("type", value);
    const qs = params.toString();
    return qs ? `/services?${qs}` : "/services";
  };

  const categoryHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (city) params.set("city", city);
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    const qs = params.toString();
    return qs ? `/services?${qs}` : "/services";
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: "Services & Fundis in Kenya",
    url: `${siteUrl()}/services`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.total,
      itemListElement: data.services.slice(0, 20).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl()}/services/${s.id}`,
        name: s.title,
      })),
    },
  };

  return (
    <div className="bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* ─── Directory header (Stitch: eyebrow, H1, trust chips) ─── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-accent-600">
                <Shield size={16} />
                Verified Trades &amp; Pros
                <span aria-hidden className="text-text-secondary">/</span>
                <span className="text-text-secondary">Directory Desk</span>
              </p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Verified Fundis &amp; Trade Specialists
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                Contract directly with certified technicians, registered contractors, and trusted
                professional artisans across Kenya. Zero markup, zero middlemen.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-secondary px-4 py-2.5">
                <Shield size={20} className="text-primary-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">100% ID-Vetted</span>
                  <span className="text-xs text-text-secondary">Background checked</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-secondary px-4 py-2.5">
                <Clock size={20} className="text-accent-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">Direct Contact</span>
                  <span className="text-xs text-text-secondary">Call or WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Search matrix ─── */}
          <form method="GET" role="search" aria-label="Search fundis and services" className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-2 lg:flex-row lg:items-center">
            {category && <input type="hidden" name="category" value={category} />}
            {type && <input type="hidden" name="type" value={type} />}
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="service-search" className="sr-only">
                Search plumber, electrician, mason, painter
              </label>
              <input
                id="service-search"
                type="search"
                name="search"
                defaultValue={search || ""}
                placeholder="Search plumber, electrician, mason, painter..."
                autoComplete="off"
                className="min-h-touch w-full rounded-lg border border-transparent bg-surface py-3 pl-10 pr-4 text-[16px] text-text-primary placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="relative w-full lg:w-72">
              <MapPin size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="service-city" className="sr-only">
                Location
              </label>
              <input
                id="service-city"
                type="text"
                name="city"
                defaultValue={city || ""}
                placeholder="All locations"
                autoComplete="address-level2"
                className="min-h-touch w-full rounded-lg border border-transparent bg-surface py-3 pl-10 pr-4 text-[16px] text-text-primary placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex min-h-touch flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-600 lg:flex-none"
              >
                <Search size={16} />
                Filter Pros
              </button>
              {hasFilters && (
                <Link
                  href="/services"
                  className="inline-flex min-h-touch items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

          {/* ─── Category rails ─── */}
          {categories.length > 0 && (
            <nav aria-label="Service categories" className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href={categoryHref(undefined)}
                aria-current={!category ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !category
                    ? "bg-primary font-bold text-white"
                    : "bg-surface-secondary text-text-primary hover:bg-surface",
                )}
              >
                All Specialists
                <span className="text-xs opacity-80">({data.total})</span>
              </Link>
              {categories.map((cat: ServiceCategory) => (
                <Link
                  key={cat.id}
                  href={categoryHref(cat.slug)}
                  aria-current={category === cat.slug ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === cat.slug
                      ? "bg-primary font-bold text-white"
                      : "bg-surface-secondary text-text-primary hover:bg-surface",
                  )}
                >
                  {cat.name}
                  {cat._count && cat._count.serviceListings > 0 && (
                    <span className="text-xs opacity-80">({cat._count.serviceListings})</span>
                  )}
                </Link>
              ))}
            </nav>
          )}

          {/* ─── Fundi / provider toggle ─── */}
          <div className="flex gap-2" role="group" aria-label="Provider type">
            <Link
              href={typeHref(undefined)}
              aria-current={!type ? "page" : undefined}
              className={cn(
                "inline-flex min-h-touch items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                !type
                  ? "bg-primary-600 text-white"
                  : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary",
              )}
            >
              All
            </Link>
            <Link
              href={typeHref("FUNDI")}
              aria-current={type === "FUNDI" ? "page" : undefined}
              className={cn(
                "inline-flex min-h-touch items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                type === "FUNDI"
                  ? "bg-primary-600 text-white"
                  : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary",
              )}
            >
              Fundis
            </Link>
            <Link
              href={typeHref("SERVICE_PROVIDER")}
              aria-current={type === "SERVICE_PROVIDER" ? "page" : undefined}
              className={cn(
                "inline-flex min-h-touch items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                type === "SERVICE_PROVIDER"
                  ? "bg-primary-600 text-white"
                  : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary",
              )}
            >
              Service Providers
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Results ─── */}
      <section className="mx-auto max-w-7xl px-4 py-8" aria-live="polite">
        <p className="mb-6 border-b border-border pb-3 text-sm text-text-secondary">
          Showing{" "}
          <strong className="text-text-primary">
            {data.services.length} of {data.total}
          </strong>{" "}
          {data.total === 1 ? "verified specialist" : "verified specialists"}
          {category && (
            <>
              {" "}in <strong className="text-text-primary">{category}</strong>
            </>
          )}
        </p>

        {data.services.length === 0 ? (
          <div role="status" className="py-16 text-center">
            <Briefcase size={48} className="mx-auto mb-4 text-muted" />
            <p className="font-medium text-text-primary">No verified specialists found</p>
            <p className="mt-1 text-sm text-text-secondary">
              Try adjusting your search or clearing the filters.
            </p>
            {hasFilters && (
              <Link
                href="/services"
                className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Clear all filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Verified fundis and service providers">
            {data.services.map((service: ServiceListingCard) => (
              <div key={service.id} role="listitem" className="min-w-0">
                <ServiceCardCompact
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  price={service.price != null ? Number(service.price) : null}
                  currency={service.currency}
                  pricePeriod={service.pricePeriod}
                  city={service.city}
                  region={service.region}
                  images={service.images}
                  category={service.category}
                  user={service.user}
                  phone={service.user?.phone ?? null}
                />
              </div>
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <nav aria-label="Services pages" className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams();
              if (category) params.set("category", category);
              if (city) params.set("city", city);
              if (search) params.set("search", search);
              if (type) params.set("type", type);
              params.set("page", String(p));
              return (
                <Link
                  key={p}
                  href={`/services?${params}`}
                  aria-current={p === data.page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className={cn(
                    "inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg border px-4 py-2 text-sm",
                    p === data.page
                      ? "border-primary-600 bg-primary-600 font-bold text-white"
                      : "border-border text-text-secondary hover:bg-surface-secondary",
                  )}
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        )}
      </section>

      {/* ─── Fundi registration banner ─── */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-primary-600 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent-200">
                <Briefcase size={14} />
                Kenya Artisan Network
              </p>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
                Are You a Skilled Fundi or Service Provider in Kenya?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-primary-100">
                Register your profile for free and get direct phone calls and WhatsApp inquiries
                from property owners and estate managers. No commissions taken on your labor.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex min-h-touch shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-accent-600"
            >
              Register as a Fundi
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
