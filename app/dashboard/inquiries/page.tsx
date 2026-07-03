import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function InquiriesPage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const inquiries = await prisma.inquiry.findMany({
    where: { property: { agentId: userId } },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true } },
    },
  });

  if (inquiries.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Inquiries
        </h1>
        <EmptyState
          title="No inquiries yet"
          description="Inquiries from potential buyers will appear here."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Inquiries
      </h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-secondary text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-surface-secondary">
                <td className="px-4 py-3 font-medium text-text-primary">
                  {inquiry.name}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {inquiry.email}
                </td>
<td className="px-4 py-3 text-text-secondary">
                    {inquiry.property?.title || "General inquiry"}
                  </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      inquiry.status === "PENDING"
                        ? "bg-warning-500/10 text-warning-500"
                        : inquiry.status === "READ"
                          ? "bg-primary-50 text-primary-600"
                          : inquiry.status === "RESPONDED"
                            ? "bg-success-500/10 text-success-700"
                            : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {inquiry.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
