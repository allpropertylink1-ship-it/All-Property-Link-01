import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus } from "lucide-react";

export default async function ListingsPage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const listings = await prisma.property.findMany({
    where: { agentId: userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      moderationStatus: true,
      city: true,
      createdAt: true,
    },
  });

  if (listings.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            My Listings
          </h1>
        </div>
        <EmptyState
          title="No listings yet"
          description="Create your first property listing to get started."
          action={{ label: "Create listing", href: "/dashboard/listings/new" }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          My Listings
        </h1>
        <Link
          href="/dashboard/listings/new"
          className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700"
        >
          <Plus size={18} />
          New listing
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-secondary text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Moderation</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium" />
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
                  {listing.currency} {Number(listing.price).toLocaleString()}
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
                  {listing.createdAt.toLocaleDateString()}
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
    </div>
  );
}
