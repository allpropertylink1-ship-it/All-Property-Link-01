import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Home, Building2, MessageSquare, Bookmark } from "lucide-react";
import Link from "next/link";

async function getStats(userId: string) {
  const [totalListings, activeListings, totalInquiries, savedSearches] =
    await Promise.all([
      prisma.property.count({ where: { agentId: userId, deletedAt: null } }),
      prisma.property.count({
        where: {
          agentId: userId,
          isPublished: true,
          deletedAt: null,
        },
      }),
      prisma.inquiry.count({
        where: {
          property: { agentId: userId },
        },
      }),
      prisma.savedSearch.count({ where: { userId } }),
    ]);

  return { totalListings, activeListings, totalInquiries, savedSearches };
}

const statCards = [
  {
    key: "totalListings",
    label: "Total Listings",
    icon: Building2,
    href: "/dashboard/listings",
  },
  {
    key: "activeListings",
    label: "Active Listings",
    icon: Home,
    href: "/dashboard/listings",
  },
  {
    key: "totalInquiries",
    label: "Total Inquiries",
    icon: MessageSquare,
    href: "/dashboard/inquiries",
  },
  {
    key: "savedSearches",
    label: "Saved Searches",
    icon: Bookmark,
    href: "/dashboard/saved-searches",
  },
] as const;

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingComplete: true },
  });

  if (user && !user.onboardingComplete) {
    redirect("/dashboard/onboarding");
  }

  const stats = await getStats(userId);

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">
        Welcome, {session.user?.name || "User"}
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Here&apos;s an overview of your activity
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                <Icon size={24} className="text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-text-primary">{value}</p>
              <p className="mt-1 text-sm text-text-secondary">{card.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
