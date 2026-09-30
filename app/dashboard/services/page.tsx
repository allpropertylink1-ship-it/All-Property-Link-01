import Link from "next/link";
import { requireAuth, serverFetch } from "@/lib/auth-utils";
import { personaRedirectTarget } from "@/lib/persona";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListingRowActions } from "@/components/dashboard/ListingRowActions";
import { Building2, Plus, ArrowRight } from "@/components/ui/icons";

interface ServiceRow {
  id: string;
  title: string;
  category: { id: string; name: string; slug: string } | null;
  city: string | null;
  moderationStatus: string;
  reviewCount: number;
}

function statusPill(status: string) {
  if (status === "APPROVED") return { cls: "bg-success-500/10 text-success-700", label: "Active" };
  if (status === "REJECTED") return { cls: "bg-error-500/10 text-error-600", label: "Rejected" };
  return { cls: "bg-warning-500/10 text-warning-700", label: "Pending" };
}

export default async function MyServicesPage({ searchParams }: { searchParams?: { bin?: string } }) {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] };
  const personaTarget = personaRedirectTarget(me);
  if (personaTarget) {
    redirect(personaTarget);
  }

  const types = me.userTypes ?? []
  const isTypelessSvc = !me.primaryUserType && types.length === 0
  if (!types.includes("FUNDI") && !types.includes("SERVICE_PROVIDER")) {
    if (isTypelessSvc) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={48} className="text-muted mb-4" />
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Complete Your Setup</h2>
          <p className="text-text-secondary mb-6 max-w-md">
            Please choose your account type to manage service listings.
          </p>
          <Link href="/dashboard/choose-role" className="touch-target inline-flex min-h-[44px] items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
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
          Only Fundis and Service Providers can manage service listings.
        </p>
        <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const inBin = searchParams?.bin === "1";
  const res = await serverFetch(`/api/user/services${inBin ? "?deleted=1" : ""}`);
  const data = await res.json().catch(() => null);
  const services: ServiceRow[] = data?.services || [];

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <section aria-labelledby="services-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Service business
          </p>
          <h1 id="services-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
            My Services
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Your single service listing covers all your specialties, with live moderation status.</p>
          <div className="mt-3 flex gap-2 text-sm">
            <Link href="/dashboard/services" className={!inBin ? "font-semibold text-primary-600" : "text-text-secondary hover:text-primary-600"}>Active</Link>
            <span aria-hidden="true" className="text-border">|</span>
            <Link href="/dashboard/services?bin=1" className={inBin ? "font-semibold text-primary-600" : "text-text-secondary hover:text-primary-600"}>Recycle bin</Link>
          </div>
        </section>
        <EmptyState
          title={inBin ? "Bin is empty" : "No services yet"}
          description={inBin ? "Deleted services stay here 3 days before permanent removal." : "Create your single service listing to get hired — it covers all your specialties."}
          action={inBin ? undefined : { label: "Create my listing", href: "/dashboard/services/new" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="services-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Service business
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="services-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary">
              {inBin ? "My Services" : services.length === 1 ? "My Listing" : "My Services"}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {inBin
                ? `${services.length} deleted service${services.length !== 1 ? "s" : ""} — auto-removed after 3 days`
                : services.length === 1
                  ? "Your single listing — it covers all your specialties"
                  : `${services.length} services (grandfathered) — edit existing, no new creates`}
            </p>
          </div>
          {!inBin && services.length === 1 ? (
            <Link
              href={`/dashboard/services/${services[0].id}/edit`}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
            >
              Edit my listing
              <ArrowRight size={16} />
            </Link>
          ) : !inBin && services.length === 0 ? (
            <Link
              href="/dashboard/services/new"
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
            >
              <Plus size={18} />
              Create my listing
            </Link>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2 text-sm">
          <Link href="/dashboard/services" className={!inBin ? "font-semibold text-primary-600" : "text-text-secondary hover:text-primary-600"}>Active</Link>
          <span aria-hidden="true" className="text-border">|</span>
          <Link href="/dashboard/services?bin=1" className={inBin ? "font-semibold text-primary-600" : "text-text-secondary hover:text-primary-600"}>Recycle bin</Link>
        </div>
      </section>

      {!inBin && services.length > 1 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-sm text-primary-800" role="status">
          You have {services.length} listings from before the single-listing plan. They stay live —
          manage them below. New creates are disabled; deleting down to zero lets you post one fresh listing.
        </div>
      )}

      {/* Mobile: Stitch service cards */}
      <ul className="space-y-3 sm:hidden" aria-label="My services">
        {services.map((s) => {
          const pill = statusPill(s.moderationStatus);
          return (
            <li key={s.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{s.title}</p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">{s.category?.name} &middot; {s.city || "—"} &middot; {s.reviewCount ?? 0} reviews</p>
                </div>
                <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${pill.cls}`}>
                  {pill.label}
                </span>
              </div>
              <div className="mt-3 border-t border-border pt-3 text-right">
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={`/dashboard/services/${s.id}/edit`}
                    className="touch-target inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                  >
                    Manage <ArrowRight size={12} />
                  </Link>
                  <ListingRowActions kind="service" id={s.id} title={s.title} deleted={inBin} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: register table in a section card */}
      <section aria-label="All services" className="hidden overflow-hidden rounded-xl border border-border bg-surface sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Location</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Reviews</th>
                <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((s) => {
                const pill = statusPill(s.moderationStatus);
                return (
                  <tr key={s.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {s.title}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.category?.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.city || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${pill.cls}`}
                      >
                        {pill.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {s.reviewCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Link
                          href={`/dashboard/services/${s.id}/edit`}
                          className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                        >
                          Edit
                        </Link>
                        <ListingRowActions kind="service" id={s.id} title={s.title} deleted={inBin} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
