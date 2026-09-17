/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { requireAuth, serverFetch } from "@/lib/auth-utils";
import { personaRedirectTarget, canListProperties } from "@/lib/persona";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus, Building2, ArrowRight } from "@/components/ui/icons";

interface ListingRow {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  listingPurpose: string | null;
  status: string;
  moderationStatus: string;
  city: string | null;
  createdAt: string;
}

function formatPrice(listing: ListingRow) {
  if (listing.price == null) return "Price on request";
  const suffix = listing.listingPurpose === "FOR_RENT_SHORT_TERM" ? "/night" : listing.listingPurpose === "FOR_RENT_LONG_TERM" ? "/month" : "";
  return `${listing.currency} ${Number(listing.price).toLocaleString()}${suffix}`;
}

export default async function ListingsPage() {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] };
  const personaTarget = personaRedirectTarget(me);
  if (personaTarget) {
    redirect(personaTarget);
  }
  const isTypelessList = !me.primaryUserType && (!me.userTypes || me.userTypes.length === 0)
  if (!canListProperties(me)) {
    if (isTypelessList) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={48} className="text-muted mb-4" />
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Complete Your Setup</h2>
          <p className="text-text-secondary mb-6 max-w-md">
            Please complete identity verification to manage property listings.
          </p>
          <Link href="/dashboard/kyc" className="touch-target inline-flex min-h-[44px] items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
            Continue Setup
          </Link>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 size={48} className="text-muted mb-4" />
        <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
        <p className="text-text-secondary mb-6 text-center max-w-md">
          Only Property Owners and Agents can manage property listings.
        </p>
        <Link href="/dashboard/notifications" className="text-sm text-primary-600 hover:text-primary-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const res = await serverFetch("/api/user/properties");
  const data = await res.json().catch(() => null);
  const listings: ListingRow[] = data?.properties || [];

  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <section aria-labelledby="listings-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Portfolio
          </p>
          <h1 id="listings-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
            My Listings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Every property you have posted, with live status.</p>
        </section>
        <EmptyState
          title="No listings yet"
          description="Create your first property listing to get started."
          action={{ label: "Create listing", href: "/dashboard/listings/new" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="listings-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Portfolio
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="listings-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary">
              My Listings
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {listings.length} active propert{listings.length !== 1 ? "ies" : "y"} in your portfolio
            </p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
          >
            <Plus size={18} />
            New listing
          </Link>
        </div>
      </section>

      {/* Mobile: Stitch property cards */}
      <ul className="space-y-3 sm:hidden" aria-label="My listings">
        {listings.map((listing) => (
          <li key={listing.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-bold tracking-tight text-text-primary">{formatPrice(listing)}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-text-primary">{listing.title}</p>
                <p className="truncate text-xs text-text-secondary">{listing.city} &middot; {new Date(listing.createdAt).toLocaleDateString()}</p>
              </div>
              <span
                className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  listing.status === "AVAILABLE"
                    ? "bg-success-500/10 text-success-700"
                    : "bg-surface-secondary text-text-secondary"
                }`}
              >
                {listing.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-text-secondary">{listing.moderationStatus.replace(/_/g, " ")}</span>
              <Link
                href={`/dashboard/listings/${listing.id}/edit`}
                className="touch-target inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: Stitch register table inside a section card */}
      <section aria-label="All listings" className="hidden overflow-hidden rounded-xl border border-border bg-surface sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">City</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Moderation</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-surface-secondary">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{listing.city}</td>
                  <td className="px-4 py-3 text-text-primary">
                    {formatPrice(listing)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        listing.status === "AVAILABLE"
                          ? "bg-success-500/10 text-success-700"
                          : "bg-surface-secondary text-text-secondary"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {listing.moderationStatus.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
