"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { X, ChevronRight, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "#", label: "Airbnbs" },
  { href: "/services", label: "Services" },
  { href: "/properties?type=LAND", label: "Plots & Land" },
  { href: "/about", label: "About" },
];

export function MobileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const handleLogout = useCallback(async () => {
    close();
    await logout();
    router.refresh();
  }, [close, logout, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target relative inline-flex items-center justify-center rounded-lg p-2 text-secondary hover:bg-surface-secondary transition-colors md:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-surface shadow-2xl shadow-black/20 transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <span className="font-heading text-sm font-semibold text-primary">Menu</span>
            <button
              type="button"
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-secondary hover:bg-surface-secondary transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col py-2">
            {menuItems.map((item) => {
              const active = item.href !== "#" && pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-300/10 text-accent-300 border-r-2 border-accent-300"
                      : "text-secondary hover:bg-surface-secondary hover:text-primary"
                  )}
                >
                  {item.label}
                  <ChevronRight size={14} className="text-muted/40" />
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface">
            {user ? (
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-300 to-accent-400 text-sm font-bold text-white shadow-sm">
                    {(user.firstName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-surface-secondary hover:text-primary transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-surface-secondary hover:text-primary transition-colors"
                >
                  <User size={16} />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-error-500 hover:bg-error-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                <Link
                  href="/auth/login"
                  onClick={close}
                  className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium text-primary hover:bg-surface-secondary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={close}
                  className="flex w-full items-center justify-center rounded-lg bg-accent-300 px-4 py-3 text-sm font-medium text-white hover:bg-accent-400 transition-colors shadow-sm shadow-accent-300/20"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
