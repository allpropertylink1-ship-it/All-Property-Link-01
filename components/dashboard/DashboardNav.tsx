"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  Building2,
  MessageSquare,
  Bookmark,
  User,
  Heart,
  Bell,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Complete Your Profile", icon: Home },
  { href: "/dashboard/listings", label: "My Listings", icon: Building2 },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/dashboard/saved-searches", label: "Saved Searches", icon: Bookmark },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/kyc", label: "KYC Verification", icon: Shield },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardNav() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-target fixed left-4 top-4 z-50 flex items-center justify-center rounded-lg border border-border bg-surface p-2 lg:hidden"
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="font-heading text-lg font-bold text-primary-600">
            AllPropertyLink
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "touch-target flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                )}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="touch-target mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <Home size={20} />
            Back to site
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="touch-target flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-error-500"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
