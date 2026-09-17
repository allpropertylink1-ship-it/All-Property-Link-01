"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Shield,
  Briefcase,
  Building2,
  Bell,
  User,
  Menu,
  X,
} from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface NavLink {
  href: string
  label: string
  icon: React.ElementType
}

const primary: NavLink[] = [
  { href: "/dashboard/kyc", label: "KYC Verification", icon: Shield },
  { href: "/dashboard", label: "Business Summary", icon: Briefcase },
]

function getSecondaryNav(hasServiceAccess: boolean): NavLink[] {
  return [
    { href: "/dashboard/listings", label: "My Listings", icon: Building2 },
    ...(hasServiceAccess ? [{ href: "/dashboard/services", label: "My Services", icon: Building2 }] : []),
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ]
}

const tertiary: NavLink[] = [
  { href: "/dashboard/profile", label: "Personal Profile", icon: User },
  { href: "/dashboard/profile/business", label: "Business Profile", icon: Briefcase },
]

const agentPrimary: NavLink[] = [
  { href: "/dashboard/agent", label: "Overview", icon: Briefcase },
  { href: "/dashboard/agent/claims", label: "Claims", icon: Shield },
  { href: "/dashboard/agent/referrals", label: "Referrals", icon: User },
  { href: "/dashboard/agent/disputes", label: "Disputes", icon: Shield },
  { href: "/dashboard/agent/settings", label: "Settings", icon: User },
]

const SECTION_LABELS: Record<string, string> = {
  primary: "Verification",
  secondary: "Activity",
  tertiary: "Settings",
  agent: "APL Representative",
}

function NavGroup({ links, section, onNavigate }: { links: NavLink[]; section: keyof typeof SECTION_LABELS; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div>
      <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
        {SECTION_LABELS[section]}
      </p>
      <div className="space-y-0.5" role="list">
        {links.map((link) => {
          const Icon = link.icon
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "touch-target relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              )}
            >
              {isActive && (
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary-500" />
              )}
              <Icon size={18} className="shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function NavSections({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const userTypes = user?.userTypes ?? []
  const hasServiceAccess = userTypes.includes("FUNDI") || userTypes.includes("SERVICE_PROVIDER")

  if (user?.authMethod === "agent") {
    return <NavGroup links={agentPrimary} section="agent" onNavigate={onNavigate} />
  }
  // Customers have no business console (/dashboard bounces them home); show
  // only the pages they can actually use instead of dead-end business links.
  // (Reps returned above, so primaryUserType alone discriminates here.)
  if (user?.primaryUserType === "CUSTOMER") {
    return (
      <>
        <NavGroup links={[{ href: "/dashboard/notifications", label: "Notifications", icon: Bell }]} section="secondary" onNavigate={onNavigate} />
        <NavGroup links={[{ href: "/dashboard/profile", label: "Personal Profile", icon: User }]} section="tertiary" onNavigate={onNavigate} />
      </>
    )
  }
  return (
    <>
      <NavGroup links={primary} section="primary" onNavigate={onNavigate} />
      <NavGroup links={getSecondaryNav(hasServiceAccess)} section="secondary" onNavigate={onNavigate} />
      <NavGroup links={tertiary} section="tertiary" onNavigate={onNavigate} />
    </>
  )
}

export function DashboardNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      {/* Mobile top rail — Stitch owner dashboard collapses the left rail into a drawer */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <span className="font-heading text-sm font-bold tracking-tight text-text-primary">Dashboard</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="touch-target flex items-center justify-center rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="dashboard-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop left rail — Stitch desktop owner/agent console */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-4 lg:block" aria-label="Dashboard">
        <nav id="dashboard-nav-desktop">
          <NavSections />
        </nav>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <button type="button" aria-label="Close menu" className="absolute inset-0 cursor-default bg-text-primary/20" onClick={() => setOpen(false)} tabIndex={-1} />
          <div className="absolute left-4 right-4 top-[calc(4rem+env(safe-area-inset-top))] max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-border bg-surface shadow-lg">
            <div className="flex h-12 items-center justify-between border-b border-border px-4">
              <span className="text-[15px] font-bold tracking-tight text-text-primary">Navigation</span>
              <button
                type="button"
                className="touch-target flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-secondary"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-1 p-3" id="dashboard-nav">
              <NavSections onNavigate={() => setOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
