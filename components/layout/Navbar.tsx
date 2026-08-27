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
    <nav className="sticky top-0 z-50 border-b border-border bg-surface backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
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

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="touch-target lg:hidden flex items-center justify-center p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

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

        {/* Mobile navigation drawer */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-72 max-w-full bg-surface border-l border-border shadow-xl overflow-y-auto">
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <span className="font-semibold text-text-primary">Navigation</span>
                  <button
                    type="button"
                    className="touch-target p-2"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>
                <nav className="p-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="touch-target flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAgent && (
                    <Link
                      href="/dashboard/agent"
                      onClick={() => setMobileOpen(false)}
                      className="touch-target flex items-center gap-3 rounded-lg bg-primary-600 px-4 py-3 text-base font-medium text-white"
                    >
                      <Briefcase size={20} />
                      Agent Dashboard
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-1">
          <ClientProfileButton />
        </div>
      </div>
    </nav>
  );
}