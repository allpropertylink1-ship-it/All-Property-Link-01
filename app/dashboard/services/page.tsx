import Link from "next/link";
import { requireAuth, serverFetch } from "@/lib/auth-utils";
import { personaRedirectTarget } from "@/lib/persona";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
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

export default async function MyServicesPage() {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string; primaryUserType?: string | null; userTypes?: string[] };
  const personaTarget = personaRedirectTarget(me);
  if (personaTarget) {
    redirect(personaTarget);
  }

  const types = me.userTypes ?? []
  if (!types.includes("FUNDI") && !types.includes("SERVICE_PROVIDER")) {
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

  const res = await serverFetch("/api/user/services");
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
          <p className="mt-1 text-sm text-text-secondary">Every service you offer, with live moderation status.</p>
        </section>
        <EmptyState
          title="No services yet"
          description="Create your first service listing to get hired."
          action={{ label: "Create service", href: "/dashboard/services/new" }}
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
              My Services
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {services.length} service{services.length !== 1 ? "s" : ""} in your catalogue
            </p>
          </div>
          <Link
            href="/dashboard/services/new"
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
          >
            <Plus size={18} />
            New service
          </Link>
        </div>
      </section>

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
                <Link
                  href={`/dashboard/services/${s.id}/edit`}
                  className="touch-target inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Manage <ArrowRight size={12} />
                </Link>
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
                      <Link
                        href={`/dashboard/services/${s.id}/edit`}
                        className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        Edit
                      </Link>
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
