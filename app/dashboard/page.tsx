import { requireAuth } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {
  Building2, Bell,
  Plus, ArrowRight,
} from "lucide-react"
import Link from "next/link"

async function getStats(userId: string) {
  const [totalListings, unreadNotifications] = await Promise.all([
    prisma.property.count({ where: { agentId: userId, deletedAt: null } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ])

  return {
    totalListings,
    unreadNotifications,
  }
}

const statCards = [
  { key: "totalListings", label: "Total Listings", icon: Building2, href: "/dashboard/listings" },
  { key: "unreadNotifications", label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
] as const

const quickActions = [
  { label: "New Listing", icon: Plus, href: "/dashboard/listings/new", color: "text-primary-600 bg-primary-50" },
  { label: "Edit Profile", icon: Building2, href: "/dashboard/profile/business", color: "text-gold-600 bg-gold-50" },
  { label: "Notifications", icon: Bell, href: "/dashboard/notifications", color: "text-error-600 bg-error-50" },
]

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


    </div>
  )
}
