import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);

  const [
    totalUsers,
    totalAgents,
    totalProperties,
    pendingProperties,
    totalInquiries,
    pendingInquiries,
    pendingKyc,
    pendingApprovals,
    recentProperties,
    recentInquiries,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.aplAgent.count(),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { moderationStatus: "PENDING_REVIEW", deletedAt: null } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { kycStatus: "PENDING" } }),
    prisma.user.count({ where: { accountStatus: "PENDING_APPROVAL", deletedAt: null } }),
    prisma.property.findMany({
      where: { moderationStatus: "PENDING_REVIEW", deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, city: true, moderationStatus: true, createdAt: true, agent: { select: { firstName: true, lastName: true } } },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, property: { select: { title: true } }, status: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: "Users" },
    { label: "APL Representatives", value: totalAgents, icon: "Agen" },
    { label: "Properties", value: totalProperties, icon: "Prop" },
    { label: "Pending Approval", value: pendingProperties, icon: "Pend" },
    { label: "Pending Approval", value: pendingApprovals, icon: "Appr" },
    { label: "KYC Pending", value: pendingKyc, icon: "KYC" },
    { label: "Total Inquiries", value: totalInquiries, icon: "Inq" },
    { label: "Pending Inquiries", value: pendingInquiries, icon: "P.I" },
  ];

  return (
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
            <h2 className="font-heading text-lg font-semibold text-text-primary">Recent Properties (Pending)</h2>
          </div>
          {recentProperties.length === 0 ? (
            <EmptyState title="No pending properties" description="Properties awaiting approval will appear here." />
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

        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Recent Inquiries</h2>
          </div>
          {recentInquiries.length === 0 ? (
            <EmptyState title="No inquiries yet" description="New inquiries will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="px-6 py-4 hover:bg-surface-secondary transition-colors">
                  <p className="font-medium text-text-primary">{inq.name}</p>
                  <p className="text-sm text-text-secondary">{inq.email} • {inq.property?.title || "General"}</p>
                  <span className="inline-flex items-center gap-1 mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      inq.status === "PENDING" ? "bg-warning-500/10 text-warning-500" :
                      inq.status === "READ" ? "bg-primary-50 text-primary-600" :
                      inq.status === "RESPONDED" ? "bg-success-500/10 text-success-700" :
                      "bg-surface-secondary text-text-secondary"
                    }`}>
                      {inq.status}
                    </span>
                    <time className="text-xs text-text-secondary">{new Date(inq.createdAt).toLocaleDateString()}</time>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}