import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-4 py-24 text-center text-text-on-primary">
        <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-5xl">
          Find Your Perfect Property in Kenya
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
          Browse apartments, houses, and land for sale or rent across Kenya.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/properties"
            className="touch-target inline-flex items-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-800 shadow-lg transition-transform hover:scale-105"
          >
            Browse properties
          </Link>
          <Link
            href="/auth/register"
            className="touch-target inline-flex items-center rounded-lg border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-white/50"
          >
            List your property
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <span className="text-xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
              Browse
            </h3>
            <p className="text-sm text-text-secondary">
              Search thousands of properties across Kenya
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <span className="text-xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
              Connect
            </h3>
            <p className="text-sm text-text-secondary">
              Contact agents directly via phone or WhatsApp
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <span className="text-xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
              Own
            </h3>
            <p className="text-sm text-text-secondary">
              Find your dream home or investment property
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
