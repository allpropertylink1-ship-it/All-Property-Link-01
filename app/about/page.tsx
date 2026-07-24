import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "About Us",
  description: "All Property Link - Kenya's trusted real estate marketplace. Connecting buyers, renters, and agents across Kenya.",
};

export default function AboutPage() {
  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-surface">
        <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 px-4 py-20 text-center text-text-on-primary">
          <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-5xl">
            Kenya&apos;s Trusted Real Estate Marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
            We connect property seekers with verified agents across Kenya. Whether you&apos;re buying, renting, or investing, we make finding your perfect property simple.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary">Our Mission</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              To digitize and streamline Kenya&apos;s real estate market by providing a transparent, accessible platform where property seekers and verified agents connect directly.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Transparency</h3>
              <p className="mt-2 text-text-secondary">Verified agents, accurate listings, and clear pricing. No hidden fees or fake listings.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Trust</h3>
              <p className="mt-2 text-text-secondary">EARB-licensed agents only. Every agent verified before they can list properties.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                <svg className="h-8 w-8 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-text-primary">Speed</h3>
              <p className="mt-2 text-text-secondary">Instant WhatsApp contact with agents. Get responses in minutes, not days.</p>
            </div>
          </div>

          <div className="mb-16 grid gap-8 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">10,000+</div>
              <div className="text-text-secondary">Active Listings</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">5,000+</div>
              <div className="text-text-secondary">Verified Agents</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <div className="mb-2 font-heading text-4xl font-bold text-primary-500">50,000+</div>
              <div className="text-text-secondary">Monthly Visitors</div>
            </div>
          </div>

          <section className="rounded-lg bg-surface-secondary p-8 text-center md:p-12">
            <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
              Built for Kenya&apos;s Market
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-text-secondary">
              From Nairobi to Mombasa, Kisumu to Nakuru &mdash; we understand how Kenyans buy, rent, and sell property. That&apos;s why WhatsApp is our primary communication channel.
            </p>
            <Link
              href="/contact"
              className="touch-target inline-flex items-center justify-center rounded-lg bg-accent-300 px-8 py-3 font-medium text-white transition-colors hover:bg-accent-400"
            >
              Start Your Property Search
            </Link>
          </section>
        </section>
      </div>
    </>
  );
}