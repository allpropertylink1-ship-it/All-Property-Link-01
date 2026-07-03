export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              All Property Link
            </h3>
            <p className="text-sm text-text-secondary">
              Kenya&apos;s trusted real estate marketplace
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Properties
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="/properties" className="hover:text-primary-600">All listings</a></li>
              <li><a href="/properties?type=APARTMENT" className="hover:text-primary-600">Apartments</a></li>
              <li><a href="/properties?type=HOUSE" className="hover:text-primary-600">Houses</a></li>
              <li><a href="/properties?type=LAND" className="hover:text-primary-600">Land</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="/about" className="hover:text-primary-600">About</a></li>
              <li><a href="/contact" className="hover:text-primary-600">Contact</a></li>
              <li><a href="/faq" className="hover:text-primary-600">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="/privacy" className="hover:text-primary-600">Privacy policy</a></li>
              <li><a href="/terms" className="hover:text-primary-600">Terms of service</a></li>
              <li><a href="/cookies" className="hover:text-primary-600">Cookie policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} All Property Link. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
