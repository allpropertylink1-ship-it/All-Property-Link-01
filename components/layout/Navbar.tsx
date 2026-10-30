"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { IconBell, IconHeart } from "@tabler/icons-react"
import { Briefcase, Menu, X } from "@/components/ui/icons"
import { api } from "@/lib/api-client"
import { useFavorites } from "@/lib/favorites-context"
import dynamic from "next/dynamic"

const ClientProfileButton = dynamic(() => import("./ProfileButton").then(mod => mod.ProfileButton), { ssr: false })

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/properties", label: "PROPERTIES" },
  { href: "/airbnbs", label: "AIRBNBS" },
  { href: "/land", label: "PLOTS & LAND" },
  { href: "/services?type=FUNDI", label: "FUNDIS" },
  { href: "/services", label: "SERVICES" },
  { href: "/aplreps", label: "REPS" },
  { href: "/about", label: "ABOUT" },
]

export function Navbar() {
  const { user } = useAuth()
  const { counts } = useFavorites()
  const pathname = usePathname()
  const isActive = (href: string) => !href.includes("?") && pathname === href
  const isHome = pathname === "/"
  const isAgent = user?.authMethod === "agent"
  const isDashboard = pathname.startsWith("/dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const favCount = counts.PROPERTY + counts.SERVICE + counts.AGENT
  // Transparent overlay at the very top of the homepage; solid white once scrolled.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  useEffect(() => {
    if (user?.authMethod !== "user") {
      setUnread(0)
      return
    }
    let active = true
    api.get<{ unreadNotifications: number }>("/api/user/badges").then(({ data }) => {
      if (active) setUnread(data?.unreadNotifications ?? 0)
    })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!isHome) {
      setScrolled(true)
      return
    }
    setScrolled(window.scrollY > 40)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome, pathname])

  const overlay = isHome && !scrolled

  return (
    <>
      <nav
        className={
          isHome
            ? `fixed left-0 right-0 top-0 z-50 font-body transition-all duration-300 ${
                overlay
                  ? "border-b border-transparent bg-transparent"
                  : "border-b border-border bg-surface/95 shadow-sm backdrop-blur-md"
              }`
            : "sticky top-0 z-50 border-b border-border bg-surface/95 font-body shadow-sm backdrop-blur-md"
        }
      >
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 lg:h-[76px] lg:px-6">
          <Link href="/" className="flex min-w-0 shrink-0 items-center justify-center gap-2 leading-none" aria-label="All Property Link home">
            <Image
              src="/logos/logo-mark.png"
              alt="All Property Link"
              width={120}
              height={120}
              className="h-8 w-auto transition-all duration-300 sm:h-9"
              priority
            />
            <Image
              src="/logos/worded.png"
              alt="All Property Link"
              width={300}
              height={60}
              className="hidden h-7 w-auto transition-all duration-300 min-[400px]:block sm:h-9"
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-4 font-body xl:flex xl:gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={active
                    ? "border-b-2 border-primary py-1 text-[14px] font-bold tracking-[2.1px] text-primary transition-colors"
                    : overlay
                      ? "py-1 text-[14px] font-normal tracking-[2.1px] text-white transition-colors hover:text-white/75"
                      : "py-1 text-[14px] font-normal tracking-[2.1px] text-text-secondary transition-colors hover:text-text-primary"}
                >
                  {link.label}
                </Link>
              );
            })}
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

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Link
              href="/favorites"
              aria-label={`Saved listings${favCount > 0 ? ` (${favCount})` : ""}`}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                overlay ? "text-white hover:bg-white/10" : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              }`}
            >
              <IconHeart size={21} stroke={1.5} aria-hidden="true" />
              {favCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </Link>
            {user?.authMethod === "user" && (
              <Link
                href="/dashboard/notifications"
                aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                  overlay ? "text-white hover:bg-white/10" : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <IconBell size={21} stroke={1.5} aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <ClientProfileButton />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`hidden min-h-touch items-center rounded px-5 py-2 font-body text-[14px] font-normal tracking-[0.7px] text-white transition-all duration-300 md:inline-flex ${
                    overlay ? "text-white/90 ring-1 ring-white/30 hover:bg-white/10" : "text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className={`hidden min-h-touch items-center rounded px-5 py-2 font-body text-[14px] font-normal tracking-[0.7px] transition-all duration-300 md:inline-flex ${
                    overlay ? "bg-white text-primary-900 hover:bg-primary-50" : "bg-accent-500 text-primary-900 hover:bg-accent-400"
                  }`}
                >
                  Join APL
                </Link>
              </>
            )}
            {/* Hamburger - visible whenever the desktop link row is hidden */}
            {!isDashboard && (
              <button
                type="button"
                className={`touch-target flex h-11 w-11 items-center justify-center rounded-lg border border-transparent transition-colors xl:hidden ${
                  overlay ? "text-white hover:bg-white/10" : "hover:bg-surface-secondary"
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Mobile navigation - compact dropdown, translucent */}
      {!isDashboard && mobileOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-4 top-[calc(4rem+env(safe-area-inset-top))] max-h-[calc(100dvh-5rem)] w-full max-w-[85vw] sm:w-64 overflow-y-auto rounded-2xl bg-white border border-border shadow-2xl">
            <div className="flex h-12 items-center justify-between px-4 border-b border-border">
              <span className="text-[15px] font-bold tracking-tight text-text-primary">Navigation</span>
              <button
                type="button"
                className="flex h-11 w-11 touch-target items-center justify-center rounded-full hover:bg-surface-secondary"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={active
                      ? "flex items-center gap-3 rounded-xl bg-primary-50 px-3 py-3 text-[15px] font-bold text-primary transition-colors"
                      : "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface-secondary active:bg-primary-50"}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded bg-primary px-3 py-3 font-body text-[15px] font-bold text-white shadow-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded bg-accent-500 px-3 py-3 font-body text-[15px] font-bold text-primary-900 shadow-sm"
                  >
                    Join APL
                  </Link>
                </>
              ) : (
                <ClientProfileButton />
              )}
              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface-secondary"
              >
                <IconHeart size={18} stroke={1.5} />
                Saved listings{favCount > 0 ? ` (${favCount})` : ""}
              </Link>
              {user?.authMethod === "user" && (
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface-secondary"
                >
                  <IconBell size={18} stroke={1.5} />
                  Notifications{unread > 0 ? ` (${unread})` : ""}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
