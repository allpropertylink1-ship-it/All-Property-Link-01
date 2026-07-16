import { Suspense } from "react";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);

  const [
    totalUsers,
    totalAgents,
    totalProperties,
    pendingKyc,
    recentProperties,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.aplAgent.count(),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.property.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, city: true, moderationStatus: true, createdAt: true, agent: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: "Users" },
    { label: "APL Representatives", value: totalAgents, icon: "Prt" },
    { label: "Properties", value: totalProperties, icon: "Prop" },
    { label: "KYC Pending", value: pendingKyc, icon: "KYC" },
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
              {recentProperties.map((prop) => (
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