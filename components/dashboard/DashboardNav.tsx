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
import { useRouter } from "next/navigation"

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
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/"
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const userTypes = user?.userTypes ?? []
  const hasServiceAccess = userTypes.includes("FUNDI") || userTypes.includes("SERVICE_PROVIDER")

  return (
    <>
      {isHome && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="touch-target fixed right-4 top-4 z-50 flex items-center justify-center rounded-lg border border-transparent hover:bg-surface-secondary lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="dashboard-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="absolute right-4 top-[calc(4rem+env(safe-area-inset-top))] max-h-[calc(100dvh-5rem)] w-full max-w-[85vw] sm:w-64 overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl">
            <div className="flex h-12 items-center justify-between px-4 border-b border-border">
              <span className="text-[15px] font-bold tracking-tight text-text-primary">Navigation</span>
              <button
                type="button"
                className="flex h-11 w-11 touch-target items-center justify-center rounded-full hover:bg-surface-secondary"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="p-3 space-y-1">
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
          </div>
        </div>
      )}
    </>
  )
}
