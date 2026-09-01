"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Briefcase, Menu, X } from "@/components/ui/icons"
import dynamic from "next/dynamic"

const ClientProfileButton = dynamic(() => import("./ProfileButton").then(mod => mod.ProfileButton), { ssr: false })

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/properties?type=LAND", label: "Plots & Land" },
  { href: "/aplreps", label: "Reps" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const { user } = useAuth()
  const isAgent = user?.authMethod === "agent"
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-surface backdrop-blur">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logos/logo.png"
              alt="All Property Link"
              width={756}
              height={319}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {isAgent && (
              <Link
                href="/dashboard/agent"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Briefcase size={16} />
                Agent Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            <ClientProfileButton />
            {/* Mobile hamburger - last so it sits at far right on mobile when profile auth is hidden */}
            <button
              type="button"
              className="touch-target flex h-11 w-11 items-center justify-center rounded-lg border border-transparent hover:bg-surface-secondary lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile navigation - compact dropdown up to About, translucent */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-4 top-20 w-64 max-w-[85vw] rounded-2xl bg-surface/90 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden supports-backdrop-filter:backdrop-blur-xl">
            <div className="flex h-12 items-center justify-between px-4 border-b border-border/50">
              <span className="text-sm font-semibold text-text-primary">Navigation</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-secondary"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="p-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  {link.label}
                </Link>
              ))}
              {isAgent && (
                <Link
                  href="/dashboard/agent"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-[14px] font-medium text-white"
                >
                  <Briefcase size={16} />
                  Agent Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}