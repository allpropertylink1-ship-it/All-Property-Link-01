import { Suspense } from "react";
import { requireRole, serverFetch } from "@/lib/auth-utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);

  const [dashboardRes, propertiesRes] = await Promise.all([
    serverFetch("/api/admin/dashboard"),
    serverFetch("/api/admin/properties?limit=5"),
  ]);
  const dashboard = await dashboardRes.json().catch(() => null);
  const propertiesData = await propertiesRes.json().catch(() => null);
  const recentProperties = propertiesData?.properties || [];

  const stats = [
    { label: "Total Users", value: dashboard?.totalUsers ?? 0, icon: "Users" },
    { label: "APL Representatives", value: dashboard?.totalAgents ?? 0, icon: "Prt" },
    { label: "Active Properties", value: dashboard?.activeProperties ?? 0, icon: "Prop" },
    { label: "KYC Pending", value: dashboard?.kycPending ?? 0, icon: "KYC" },
  ];

  return (
    <Suspense fallback={<LoadingSkeleton count={6} />}>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary">Overview of platform activity</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-1 font-heading text-3xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-secondary text-xs font-bold text-text-secondary">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Recent Properties</h2>
          </div>
          {recentProperties.length === 0 ? (
            <EmptyState title="No properties yet" description="New properties will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {recentProperties.map((prop: { id: string; title: string; city: string; moderationStatus: string; createdAt: string; agent: { firstName: string; lastName: string } | null }) => (
                <div key={prop.id} className="px-6 py-4 hover:bg-surface-secondary transition-colors">
                  <p className="font-medium text-text-primary">{prop.title}</p>
                  <p className="text-sm text-text-secondary">{prop.city} • {prop.agent?.firstName} {prop.agent?.lastName}</p>
                  <span className="inline-flex items-center gap-1 mt-1">
                    <span className="inline-block rounded-full bg-warning-500/10 text-warning-500 text-xs font-medium px-2 py-0.5">
                      {prop.moderationStatus}
                    </span>
                    <time className="text-xs text-text-secondary">{new Date(prop.createdAt).toLocaleDateString()}</time>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>


      </div>
    </div>
    </Suspense>
  );
}
