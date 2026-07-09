import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {
  Building2, MessageSquare, Bookmark, Heart, Bell,
  Plus, Eye, CheckCircle, ArrowRight,
} from "lucide-react"
import Link from "next/link"

async function getStats(userId: string) {
  const [
    totalListings,
    totalInquiries,
    newInquiries,
    respondedInquiries,
    savedSearches,
    totalFavorites,
    unreadNotifications,
    recentInquiries,
  ] = await Promise.all([
    prisma.property.count({ where: { agentId: userId, deletedAt: null } }),
    prisma.inquiry.count({ where: { property: { agentId: userId } } }),
    prisma.inquiry.count({ where: { property: { agentId: userId }, status: "PENDING" } }),
    prisma.inquiry.count({ where: { property: { agentId: userId }, status: "RESPONDED" } }),
    prisma.savedSearch.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.inquiry.findMany({
      where: { property: { agentId: userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        createdAt: true,
        property: { select: { title: true } },
      },
    }),
  ])

  return {
    totalListings,
    totalInquiries, newInquiries, respondedInquiries,
    savedSearches, totalFavorites, unreadNotifications,
    recentInquiries,
  }
}

const statCards = [
  { key: "totalListings", label: "Total Listings", icon: Building2, href: "/dashboard/listings" },
  { key: "totalInquiries", label: "Total Inquiries", icon: MessageSquare, href: "/dashboard/inquiries" },
  { key: "newInquiries", label: "New Inquiries", icon: Eye, href: "/dashboard/inquiries" },
  { key: "respondedInquiries", label: "Responded", icon: CheckCircle, href: "/dashboard/inquiries" },
  { key: "savedSearches", label: "Saved Searches", icon: Bookmark, href: "/dashboard/saved-searches" },
  { key: "totalFavorites", label: "Favorites", icon: Heart, href: "/dashboard/favorites" },
  { key: "unreadNotifications", label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
] as const

const quickActions = [
  { label: "New Listing", icon: Plus, href: "/dashboard/listings/new", color: "text-primary-600 bg-primary-50" },
  { label: "View Inquiries", icon: MessageSquare, href: "/dashboard/inquiries", color: "text-teal-600 bg-teal-50" },
  { label: "Edit Profile", icon: Building2, href: "/dashboard/profile/business", color: "text-gold-600 bg-gold-50" },
  { label: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "text-error-600 bg-error-50" },
]

const statusColors: Record<string, string> = {
  PENDING: "text-warning-500",
  READ: "text-primary-600",
  RESPONDED: "text-success-600",
  CLOSED: "text-text-secondary",
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = (session.user as { id: string }).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingComplete: true, kycStatus: true, category: true, companyName: true },
  })

  if (user && (user.kycStatus === "NONE" || user.kycStatus === "REJECTED")) {
    redirect("/dashboard/kyc")
  }

  if (user && !user.onboardingComplete) {
    redirect("/dashboard/onboarding")
  }

  const stats = await getStats(userId)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold text-text-primary">
            Welcome back{user?.companyName ? `, ${user.companyName}` : ""}
          </h1>
          <p className="text-sm text-text-secondary">
            Here&apos;s an overview of your business activity
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{action.label}</p>
                  <p className="flex items-center gap-1 text-xs text-primary-600">
                    Go now <ArrowRight size={12} />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon
            const value = stats[card.key as keyof typeof stats] as number
            return (
              <Link
                key={card.key}
                href={card.href}
                className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{card.label}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {stats.recentInquiries.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Recent Inquiries</h2>
            <Link
              href="/dashboard/inquiries"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {stats.recentInquiries.map((inquiry, i) => (
              <div
                key={inquiry.id}
                className={`flex items-center justify-between px-5 py-4 ${i < stats.recentInquiries.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {inquiry.name}
                    {inquiry.property && (
                      <span className="font-normal text-text-secondary">
                        {" "}about {inquiry.property.title}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">{inquiry.email}</p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span className={`text-xs font-medium ${statusColors[inquiry.status] || ""}`}>
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
