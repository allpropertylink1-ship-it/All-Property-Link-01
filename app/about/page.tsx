import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "About Us",
  description:
    "All Property Link - Kenya's trusted marketplace for properties, short stays, fundis, and service providers. Verified listings, checked by APL representatives.",
  alternates: { canonical: "/about" },
};

function SellIcon() {
  return (
    <svg className="mx-auto mb-4 h-9 w-9 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M10 9h.01M14 9h.01" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="mx-auto mb-4 h-9 w-9 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function PalmIcon() {
  return (
    <svg className="mx-auto mb-4 h-9 w-9 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21c3-1 5-2 6-4m-6 4c3-1 5-2 6-4M21 3c-4 1-8 3-11 6m4.121 4.121a3 3 0 010-4.242M14 14l-2.879 2.879a3 3 0 01-4.242 0m0-9.899a3 3 0 00-4.54 2.235M3 21l5-5" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg className="mx-auto mb-4 h-9 w-9 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-surface">
        <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-4 py-20 text-center text-text-on-primary">
          <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Kenya&apos;s Property &amp; Services Marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
            One platform for four needs &mdash; buy or rent property, book a short stay, hire a fundi, or find a
            service provider. Every listing is checked by an APL representative before it goes live.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary">One Market, Four Doors</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              All Property Link is built for everyone in the property journey &mdash; not just buyers.
            </p>
          </div>

          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/properties" className="group rounded-lg border border-border bg-surface p-8 text-center transition-colors hover:border-accent-300">
              <SellIcon />
              <h3 className="font-heading text-xl font-semibold text-text-primary group-hover:text-primary-500">Buy &amp; Sell</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Houses, apartments, land and commercial property for sale &mdash; listed by owners and verified agents.
              </p>
            </Link>
            <Link href="/properties?purpose=FOR_RENT_LONG_TERM" className="group rounded-lg border border-border bg-surface p-8 text-center transition-colors hover:border-accent-300">
              <KeyIcon />
              <h3 className="font-heading text-xl font-semibold text-text-primary group-hover:text-primary-500">Long-term Rent</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Homes to rent across Kenyan towns and estates, with direct contact to the owner or agent.
              </p>
            </Link>
            <Link href="/properties?purpose=FOR_RENT_SHORT_TERM" className="group rounded-lg border border-border bg-surface p-8 text-center transition-colors hover:border-accent-300">
              <PalmIcon />
              <h3 className="font-heading text-xl font-semibold text-text-primary group-hover:text-primary-500">Short Stays</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Airbnb-style stays in Diani, Naivasha, Nyahururu and beyond &mdash; book by the night.
              </p>
            </Link>
            <Link href="/services" className="group rounded-lg border border-border bg-surface p-8 text-center transition-colors hover:border-accent-300">
              <WrenchIcon />
              <h3 className="font-heading text-xl font-semibold text-text-primary group-hover:text-primary-500">Fundis &amp; Services</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Skilled trades and property services &mdash; plumbers, electricians, cleaners, security and more.
              </p>
            </Link>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Transparency</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Real listings with accurate pricing and owner contact details. No hidden fees.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Verified</h3>
              <p className="mt-2 text-sm text-text-secondary">
                APL representatives check listings and identity documents before anything goes live.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Direct Contact</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Call, SMS or WhatsApp the owner or agent directly &mdash; no middlemen, no gatekeeping.
              </p>
            </div>
          </div>

          <div className="mb-16 grid gap-8 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">237+</div>
              <div className="text-text-secondary">Properties Listed</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">164</div>
              <div className="text-text-secondary">Fundis &amp; Service Providers</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">45+</div>
              <div className="text-text-secondary">Towns Covered</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">10</div>
              <div className="text-text-secondary">APL Representatives</div>
            </div>
          </div>

          <section className="rounded-lg bg-surface-secondary p-8 text-center md:p-12">
            <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
              Built for Kenya&apos;s Market
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-text-secondary">
              From Nairobi to Mombasa, Kisumu to Nakuru &mdash; we connect Kenyans the way they already do business:
              by phone, SMS, and WhatsApp. APL representatives are on the ground in every region we serve.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/properties"
                className="touch-target inline-flex items-center justify-center rounded-lg bg-accent-300 px-8 py-3 font-medium text-white transition-colors hover:bg-accent-400"
              >
                Explore Listings
              </Link>
              <Link
                href="/auth/register"
                className="touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-8 py-3 font-medium text-text-primary transition-colors hover:border-accent-300"
              >
                Create a Free Account
              </Link>
            </div>
          </section>
        </section>
      </div>
    </>
  );
}