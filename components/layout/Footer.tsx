import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-content px-4 py-16">
        <div className="mb-12">
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-primary"
          >
            All Property{" "}
            <span className="text-accent-300">Link</span>
          </Link>
          <p className="mt-2 max-w-md text-sm text-secondary">
            Kenya&apos;s marketplace for properties, stays, fundis, and service
            providers.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold text-primary">
              Browse
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <Link
                  href="/properties"
                  className="transition-colors hover:text-primary"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  Airbnbs
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  Fundis
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=LAND"
                  className="transition-colors hover:text-primary"
                >
                  Plots & Land
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold text-primary">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-primary"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold text-primary">
              For owners
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  List a property
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  Register as fundi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-primary"
                >
                  Register as provider
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold text-primary">
              Brand
            </h3>
            <p className="text-sm leading-relaxed text-secondary">
              All Property Link connects buyers, renters, travelers, fundis, and
              service providers across Kenya.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-secondary">
            &copy; {new Date().getFullYear()} All Property Link. All rights
            reserved.
          </p>
          <p className="text-xs text-secondary">Built for Kenya</p>
        </div>
      </div>
    </footer>
  );
}
