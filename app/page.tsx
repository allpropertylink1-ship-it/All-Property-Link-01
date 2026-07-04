import Link from "next/link";

const categories = [
  {
    title: "Properties",
    slug: "/properties",
    count: "1,200+ listings",
    image: "/categories/properties.jpg",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Airbnbs",
    slug: "#",
    count: "300+ stays",
    image: "/categories/airbnbs.jpg",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Fundis",
    slug: "#",
    count: "500+ professionals",
    image: "/categories/fundis.jpg",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
  {
    title: "Plots & Land",
    slug: "/properties?type=LAND",
    count: "400+ plots",
    image: "/categories/plots.jpg",
    gradient: "from-primary-900/80 via-primary-800/60 to-transparent",
  },
];

const featuredProperties = [
  {
    title: "Modern 3-Bedroom Apartment",
    location: "Westlands, Nairobi",
    price: "KSh 15,000,000",
    badge: "Sale",
    urgency: "Hot Deal",
    verified: true,
    image: "/featured/property-1.jpg",
  },
  {
    title: "Spacious 4-Bedroom Villa",
    location: "Runda, Nairobi",
    price: "KSh 45,000,000",
    badge: "Sale",
    urgency: null,
    verified: true,
    image: "/featured/property-2.jpg",
  },
  {
    title: "Cozy 2-Bedroom Furnished Unit",
    location: "Kilimani, Nairobi",
    price: "KSh 85,000/mo",
    badge: "Rent",
    urgency: "New",
    verified: true,
    image: "/featured/property-3.jpg",
  },
  {
    title: "Commercial Space on Mombasa Road",
    location: "Mombasa Road, Nairobi",
    price: "KSh 120,000/mo",
    badge: "Rent",
    urgency: null,
    verified: false,
    image: "/featured/property-4.jpg",
  },
];

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

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
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

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-24 text-center text-text-onPrimary md:py-32">
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
          <div className="mx-auto mt-10 flex w-full max-w-xl items-center gap-2 rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/10 px-4 py-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-primary-100" />
              <input
                type="text"
                placeholder="Search properties, fundis, services..."
                className="w-full bg-transparent text-sm text-text-onPrimary placeholder-primary-100 outline-none"
              />
            </div>
            <button className="touch-target shrink-0 rounded-lg bg-accent-300 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-400">
              Search
            </button>
          </div>
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
      <section className="bg-surface-secondary px-4 py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-10 text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Browse by category
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              What are you looking for?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.slug}
                className="reveal group relative flex h-64 items-end overflow-hidden rounded-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 w-full p-6">
                  <h3 className="font-heading text-lg font-bold text-white">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">{cat.count}</p>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-all group-hover:ring-accent-300/50" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="bg-surface px-4 py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-10 text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Our reach
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              Trusted across Kenya
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UsersIcon, label: "10,000+", desc: "Active users" },
              { icon: ShieldIcon, label: "1,200+", desc: "Properties listed" },
              { icon: MapPinIcon, label: "12+", desc: "Counties covered" },
              { icon: StarIcon, label: "4.8/5", desc: "Average rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="reveal rounded-xl border border-border bg-surface p-8 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <stat.icon className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-heading text-2xl font-bold text-text-primary">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-surface-secondary px-4 py-20">
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
            {featuredProperties.map((prop) => (
              <div
                key={prop.title}
                className="reveal group overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImagePlaceholderIcon className="h-10 w-10 text-text-secondary/40" />
                  </div>
                  <div className="absolute left-2 top-2 z-10 flex gap-2">
                    <span className="rounded-full bg-accent-300 px-3 py-1 text-xs font-semibold text-white">
                      {prop.badge}
                    </span>
                    {prop.urgency && (
                      <span className="rounded-full bg-warning-500 px-3 py-1 text-xs font-semibold text-white">
                        {prop.urgency}
                      </span>
                    )}
                  </div>
                  {prop.verified && (
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-success-500/90 px-2.5 py-1 text-xs font-medium text-white">
                      <VerifiedIcon className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="font-heading font-semibold text-text-primary line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                    {prop.location}
                  </div>
                  <p className="font-heading text-base font-bold text-primary-500">
                    {prop.price}
                  </p>
                </div>
              </div>
            ))}
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
      <section className="bg-surface px-4 py-20">
        <div className="wrap mx-auto max-w-content">
          <div className="mb-10 text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-accent-300">
              Who we serve
            </span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
              What We Offer
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="reveal rounded-xl border border-border bg-surface p-8 text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <HomeIcon className="h-7 w-7 text-primary-500" />
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
            <div className="reveal rounded-xl border border-border bg-surface p-8 text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <BriefcaseIcon className="h-7 w-7 text-primary-500" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
                For Agents & Landlords
              </h3>
              <ul className="space-y-2 text-left text-sm text-text-secondary">
                {["List properties and reach thousands of buyers", "Get featured and stand out from the crowd", "Manage inquiries and close deals faster"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="reveal rounded-xl border border-border bg-surface p-8 text-center transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <WrenchIcon className="h-7 w-7 text-primary-500" />
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
      <section className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-20 text-center text-text-onPrimary">
        <div className="wrap mx-auto max-w-content">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-300/20">
                <CheckIcon className="h-4 w-4 text-accent-300" />
              </div>
              <span className="text-sm text-accent-200">Free to list</span>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-300/20">
                <CheckIcon className="h-4 w-4 text-accent-300" />
              </div>
              <span className="text-sm text-accent-200">No commission</span>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-300/20">
                <CheckIcon className="h-4 w-4 text-accent-300" />
              </div>
              <span className="text-sm text-accent-200">Instant visibility</span>
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
