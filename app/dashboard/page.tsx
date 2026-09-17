import { requireAuth, serverFetch } from "@/lib/auth-utils"
import { personaRedirectTarget } from "@/lib/persona"
import { redirect } from "next/navigation"
import {
  Building2, Bell, Wrench,
  Plus, ArrowRight,
} from "@/components/ui/icons"
import Link from "next/link"

async function getStats() {
  const res = await serverFetch(`/api/user/stats`)
  if (!res.ok) return { totalListings: 0, totalServices: 0, unreadNotifications: 0 }
  const data = await res.json().catch(() => null)
  return data?.stats || { totalListings: 0, totalServices: 0, unreadNotifications: 0 }
}

const statCards = [
  { key: "totalListings", label: "Total Listings", hint: "Across sale and rent", icon: Building2, href: "/dashboard/listings" },
  { key: "totalServices", label: "Services", hint: "Active offerings", icon: Wrench, href: "/dashboard/services" },
  { key: "unreadNotifications", label: "Notifications", hint: "Needs your attention", icon: Bell, href: "/dashboard/notifications" },
] as const

const quickActions = [
  { label: "New Listing", hint: "Post a property", icon: Plus, href: "/dashboard/listings/new", color: "text-primary-600 bg-primary-50" },
  { label: "New Service", hint: "Offer a service", icon: Wrench, href: "/dashboard/services/new", color: "text-accent-500 bg-accent-50" },
  { label: "Edit Profile", hint: "Business details", icon: Building2, href: "/dashboard/profile/business", color: "text-text-secondary bg-surface-secondary" },
  { label: "Notifications", hint: "Inbox and alerts", icon: Bell, href: "/dashboard/notifications", color: "text-error-500 bg-error-50" },
]

export default async function DashboardPage() {
  const session = await requireAuth()
  const user = session.user as {
    id: string
    kycStatus?: string
    onboardingComplete?: boolean
    companyName?: string | null
    authMethod?: "user" | "agent" | "admin"
    primaryUserType?: string | null
    userTypes?: string[]
  }

  // Reps and customers never see the Business Summary dashboard.
  const personaTarget = personaRedirectTarget(
    { authMethod: user.authMethod, primaryUserType: user.primaryUserType, userTypes: user.userTypes },
    { customerTo: "/dashboard/notifications" }
  )
  if (personaTarget) {
    redirect(personaTarget)
  }

  // New flow: KYC before account type. Typeless users must verify first, then choose type.
  const isTypeless = !user.primaryUserType && (!user.userTypes || user.userTypes.length === 0)
  if (isTypeless) {
    if (user.kycStatus === "NONE" || user.kycStatus === "REJECTED" || user.kycStatus === "PENDING") {
      redirect("/dashboard/kyc")
    }
    if (user.onboardingComplete === false || user.onboardingComplete === null || user.onboardingComplete === undefined) {
      redirect("/dashboard/onboarding")
    }
  } else {
    if (user.kycStatus === "NONE" || user.kycStatus === "REJECTED") {
      redirect("/dashboard/kyc")
    }
    if (user.onboardingComplete === false) {
      redirect("/dashboard/onboarding")
    }
  }

  const stats = await getStats()

  return (
    <div className="space-y-6">
      {/* Stitch owner console header — identity strip */}
      <section aria-labelledby="dashboard-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Owner console
        </p>
        <h1 id="dashboard-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          Welcome back{user.companyName ? `, ${user.companyName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s an overview of your business activity
        </p>
      </section>

      {/* Stitch stat-card row */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="mb-3 font-heading text-base font-semibold text-text-primary">Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon
            const value = stats[card.key] as number
            return (
              <Link
                key={card.key}
                href={card.href}
                className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
                aria-label={`${card.label}: ${value}`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <p className="font-heading text-2xl font-bold tracking-tight text-text-primary">{value}</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{card.label}</p>
                <p className="text-xs text-text-secondary">{card.hint}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Stitch quick-action rail */}
      <section aria-labelledby="actions-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="actions-heading" className="mb-1 font-heading text-base font-semibold text-text-primary">Quick Actions</h2>
        <p className="mb-4 text-sm text-text-secondary">Jump straight into the task that matters today.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="touch-target flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{action.label}</p>
                  <p className="truncate text-xs text-text-secondary">{action.hint}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary-600">
                    Go now <ArrowRight size={12} />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>


    </div>
  )
}
