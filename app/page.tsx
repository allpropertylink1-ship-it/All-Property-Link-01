import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const categories = [
  {
    title: "Properties",
    slug: "/properties",
    count: "1,200+ listings",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Airbnbs",
    slug: "/properties?purpose=FOR_RENT_SHORT_TERM",
    count: "300+ stays",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Services",
    slug: "/services",
    count: "500+ pros",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Plots & Land",
    slug: "/properties?type=LAND",
    count: "400+ plots",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
];

function formatPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString()}`;
}

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { deletedAt: null },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      slug: true, title: true, price: true, currency: true,
      propertyType: true, listingPurpose: true, city: true, region: true,
      images: true, isFeatured: true, createdAt: true,
    },
  });
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export default async function HomePage() {
  const [featuredProperties, propertyCount, cityCount] = await Promise.all([
    getFeaturedProperties(),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.groupBy({ by: ["city"], where: { deletedAt: null }, _count: { city: true } }),
  ]);
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-16 text-center text-text-onPrimary md:py-32">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5" />
        <div className="wrap mx-auto max-w-content relative z-10">
          <h1 className="mx-auto max-w-4xl font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Your Most Reliable Link To{" "}
            <span className="bg-gradient-to-r from-accent-300 to-accent bg-clip-text text-transparent">
              Properties, Fundis, Airbnbs & Service Providers
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-primary-100 md:text-lg">
            Find a home, book a stay, hire a fundi, or offer your services.
          </p>
          <form
            action="/properties/search"
            method="GET"
            className="mx-auto mt-10 flex w-full max-w-xl items-center gap-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm"
          >
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/10 px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-primary-100" />
              <input
                type="text"
                name="q"
                placeholder="Search properties, fundis, services..."
                className="w-full bg-transparent text-sm text-text-onPrimary placeholder-primary-100 outline-none"
              />
            </div>
            <button type="submit" className="touch-target shrink-0 rounded-lg bg-accent-300 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-400">
              Search
            </button>
          </form>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/properties"
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg transition-transform hover:scale-105"
            >
              Browse properties
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="touch-target inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-white/50"
            >
              List your property
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-surface-secondary px-4 py-14 md:py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-6 text-center md:mb-10">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Browse by category
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              What are you looking for?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.slug}
                className="reveal group relative flex h-44 items-end overflow-hidden rounded-xl sm:h-56"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 w-full p-4 sm:p-6">
                  <h3 className="font-heading text-base font-bold text-white sm:text-lg">
                    {cat.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/80 sm:text-sm">{cat.count}</p>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-all group-hover:ring-accent-300/50" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-surface px-4 py-14 md:py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-6 text-center md:mb-10">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Our reach
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              Trusted across Kenya
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {[
              { icon: UsersIcon, label: "1,000+", desc: "Active users" },
              { icon: ShieldIcon, label: `${propertyCount}+`, desc: "Properties listed" },
              { icon: MapPinIcon, label: `${cityCount.length}+`, desc: "Counties covered" },
              { icon: StarIcon, label: "4.8/5", desc: "Average rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="reveal rounded-xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md md:p-8"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 md:mb-4 md:h-12 md:w-12">
                  <stat.icon className="h-5 w-5 text-primary-500 md:h-6 md:w-6" />
                </div>
                <p className="font-heading text-xl font-bold text-text-primary md:text-2xl">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary md:mt-1 md:text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-surface-secondary px-4 py-14 md:py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
                Featured listings
              </span>
              <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
                Properties
              </h2>
            </div>
            <Link
              href="/properties"
              className="touch-target hidden items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-600 sm:flex"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((prop) => {
              const images = Array.isArray(prop.images) ? prop.images : [];
                const imageUrl = images.length > 0 ? String(images[0]) : "/placeholder.jpg";
              const purpose = prop.listingPurpose;
              return (
                <Link
                  key={prop.slug}
                  href={`/properties/${prop.city.toLowerCase()}/${prop.slug}`}
                  className="reveal group overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
                    <Image
                      src={imageUrl}
                      alt={prop.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute left-2 top-2 z-10 flex gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${purpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-300" : purpose === "FOR_RENT_LONG_TERM" ? "bg-warning-500" : "bg-primary-500"}`}>
                        {purpose === "FOR_RENT_SHORT_TERM" ? "Airbnb" : purpose === "FOR_RENT_LONG_TERM" ? "Rent" : "Sale"}
                      </span>
                      {prop.isFeatured && (
                        <span className="rounded-full bg-warning-500 px-3 py-1 text-xs font-semibold text-white">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-success-500/90 px-2.5 py-1 text-xs font-medium text-white">
                      <VerifiedIcon className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <h3 className="font-heading font-semibold text-text-primary line-clamp-1">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                      {prop.region}, {prop.city}
                    </div>
                    <p className="font-heading text-base font-bold text-primary-500">
                      {formatPrice(Number(prop.price), prop.currency)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/properties"
              className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-primary-500"
            >
              View all properties
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-surface px-4 py-14 md:py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-6 text-center md:mb-10">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Who we serve
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              What We Offer
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="reveal rounded-xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md md:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 md:mb-4 md:h-14 md:w-14">
                <HomeIcon className="h-6 w-6 text-primary-500 md:h-7 md:w-7" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                For Buyers & Tenants
              </h3>
              <ul className="space-y-2 text-left text-sm text-text-secondary">
                {["Browse thousands of listings across Kenya", "Contact agents and landlords directly", "Find your dream home or investment"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="reveal rounded-xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md md:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 md:mb-4 md:h-14 md:w-14">
                <BriefcaseIcon className="h-6 w-6 text-primary-500 md:h-7 md:w-7" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                For Agents & Landlords
              </h3>
              <ul className="space-y-2 text-left text-sm text-text-secondary">
                {["List properties and reach thousands of buyers", "Get featured and stand out from the crowd", "Get more visibility and close deals faster"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="reveal rounded-xl border border-border bg-surface p-5 text-center transition-shadow hover:shadow-md md:p-8">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 md:mb-4 md:h-14 md:w-14">
                <WrenchIcon className="h-6 w-6 text-primary-500 md:h-7 md:w-7" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                For Service Providers
              </h3>
              <ul className="space-y-2 text-left text-sm text-text-secondary">
                {["Register your fundi or service business", "Get hired by homeowners and tenants nearby", "Grow your reputation and earn more"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-14 text-center text-text-onPrimary md:py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-300/20 sm:h-8 sm:w-8">
                  <CheckIcon className="h-3 w-3 text-accent-300 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs text-accent-200 sm:text-sm">Free to list</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-300/20 sm:h-8 sm:w-8">
                  <CheckIcon className="h-3 w-3 text-accent-300 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs text-accent-200 sm:text-sm">No commission</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-300/20 sm:h-8 sm:w-8">
                  <CheckIcon className="h-3 w-3 text-accent-300 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs text-accent-200 sm:text-sm">Instant visibility</span>
              </div>
            </div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">
              Ready to list? Start free today.
            </h2>
            <p className="max-w-lg text-base text-primary-100">
              Create a free account and list your property, Airbnb, or service in minutes. Reach thousands of potential customers across Kenya.
            </p>
            <Link
              href="/auth/register"
              className="touch-target mt-2 inline-flex items-center gap-2 rounded-lg bg-accent-300 px-8 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Create free account
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
