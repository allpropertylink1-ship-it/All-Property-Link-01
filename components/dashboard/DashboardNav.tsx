"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Shield,
  Briefcase,
  Building2,
  Bell,
  User,
  ArrowLeft,
  LogOut,
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

function NavGroup({ links, section }: { links: NavLink[]; section: keyof typeof SECTION_LABELS }) {
  const pathname = usePathname()

  return (
    <div>
      <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted">
        {SECTION_LABELS[section]}
      </p>
      <div className="space-y-0.5">
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
              className={cn(
                "touch-target relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary-500" />
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

export function DashboardNav() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const userTypes = user?.userTypes ?? []
  const hasServiceAccess = userTypes.includes("FUNDI") || userTypes.includes("SERVICE_PROVIDER")

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-target fixed left-4 top-4 z-50 flex items-center justify-center rounded-lg border border-border bg-surface p-2.5 shadow-sm lg:hidden"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="dashboard-nav"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="dashboard-nav"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-border bg-surface transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logos/logo.png"
              alt="All Property Link"
              width={756}
              height={319}
              className="h-8 w-auto"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-text-secondary">{user?.firstName || ""}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard menu">
          {user?.authMethod === "agent" ? (
            <NavGroup links={agentPrimary} section="agent" />
          ) : (
            <>
              <NavGroup links={primary} section="primary" />
              <NavGroup links={getSecondaryNav(hasServiceAccess)} section="secondary" />
              <NavGroup links={tertiary} section="tertiary" />
            </>
          )}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="touch-target flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-surface-secondary hover:text-text-primary"
          >
            <ArrowLeft size={18} className="shrink-0" />
            Back to site
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="touch-target mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-surface-secondary hover:text-error-500"
          >
            <LogOut size={18} className="shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
