import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus } from "lucide-react";

export default async function MyServicesPage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const services = await prisma.serviceListing.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  const serviceIds = services.map(s => s.id)
  const reviewCounts = await prisma.review.groupBy({
    by: ["targetId"],
    where: { targetType: "SERVICE_LISTING", targetId: { in: serviceIds } },
    _count: { targetId: true },
  })
  const reviewCountMap = new Map(reviewCounts.map(r => [r.targetId, r._count.targetId]))

  if (services.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            My Services
          </h1>
        </div>
        <EmptyState
          title="No services yet"
          description="Create your first service listing to get hired."
          action={{ label: "Create service", href: "/dashboard/services/new" }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          My Services
        </h1>
        <Link
          href="/dashboard/services/new"
          className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
        >
          <Plus size={18} />
          New service
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-secondary text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reviews</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-surface-secondary">
                <td className="px-4 py-3 font-medium text-text-primary">
                  {s.title}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {s.category.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {s.city || "\u2014"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.moderationStatus === "APPROVED"
                        ? "bg-success-500/10 text-success-700"
                        : s.moderationStatus === "REJECTED"
                          ? "bg-error-500/10 text-error-600"
                          : "bg-warning-500/10 text-warning-700"
                    }`}
                  >
                    {s.moderationStatus === "APPROVED"
                      ? "Active"
                      : s.moderationStatus === "REJECTED"
                        ? "Rejected"
                        : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {reviewCountMap.get(s.id) ?? 0}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
