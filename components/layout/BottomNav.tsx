"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const GOLD = "#D49A44";

const SaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M3 10l9-8 9 8v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <rect x="9" y="14" width="6" height="6" />
    <rect x="11" y="15" width="2" height="3" fill={GOLD} stroke="none" rx="0.5" />
  </svg>
);

const RentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <rect x="10" y="12" width="4" height="2" fill={GOLD} stroke="none" rx="0.5" />
  </svg>
);

const StayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M2 4v16" />
    <path d="M22 4v16" />
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <rect x="6" y="10" width="6" height="4" rx="1" />
    <rect x="6" y="10" width="6" height="1" fill={GOLD} stroke="none" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const LandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <polygon points="12,2 2,22 22,22" />
    <line x1="12" y1="2" x2="7" y2="22" />
    <line x1="12" y1="2" x2="17" y2="22" />
    <circle cx="12" cy="12" r="1.5" fill={GOLD} stroke="none" />
  </svg>
);

const FundiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    <rect x="14" y="14" width="3" height="2" fill={GOLD} stroke="none" rx="0.5" />
  </svg>
);

const ServiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <rect x="6" y="7" width="12" height="4" />
    <rect x="10" y="12" width="4" height="2" fill={GOLD} stroke="none" rx="1" />
    <line x1="9" y1="3" x2="15" y2="3" />
    <line x1="12" y1="3" x2="12" y2="7" />
  </svg>
);

const categories = [
  { href: "/properties?purpose=FOR_SALE", label: "Properties for Sale", icon: SaleIcon },
  { href: "/properties?purpose=FOR_RENT_LONG_TERM", label: "Long-Term Rentals", icon: RentIcon },
  { href: "/properties?purpose=FOR_RENT_SHORT_TERM", label: "Short-Term Stays", icon: StayIcon },
  { href: "/properties?type=LAND", label: "Plots & Land", icon: LandIcon },
  { href: "/services?type=FUNDI", label: "Fundis", icon: FundiIcon },
  { href: "/services?type=SERVICE_PROVIDER", label: "Service Providers", icon: ServiceIcon },
];

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M3 10l9-8 9 8v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <rect x="9" y="14" width="6" height="6" />
    <rect x="11" y="15" width="2" height="3" fill={GOLD} stroke="none" rx="0.5" />
  </svg>
);

const BrowseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="5" y="5" width="3" height="3" fill={GOLD} stroke="none" rx="0.5" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <circle cx="12" cy="8" r="5" />
    <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
    <circle cx="12" cy="8" r="2" fill={GOLD} stroke="none" />
  </svg>
);

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [browseOpen, setBrowseOpen] = useState(false);

  const homeActive = pathname === "/";

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 py-2 flex-1"
          >
            <div className={`flex h-6 w-6 items-center justify-center ${homeActive ? "text-accent-300" : "text-text-secondary"}`}>
              <HomeIcon />
            </div>
            <span className={`text-[10px] font-medium ${homeActive ? "text-accent-300" : "text-text-secondary"}`}>
              Home
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setBrowseOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 flex-1"
          >
            <div className="flex h-6 w-6 items-center justify-center text-text-secondary">
              <BrowseIcon />
            </div>
            <span className="text-[10px] font-medium text-text-secondary">
              Browse
            </span>
          </button>

          <Link
            href={user ? "/dashboard" : "/auth/login"}
            className="flex flex-col items-center gap-0.5 py-2 flex-1"
          >
            <div className={`flex h-6 w-6 items-center justify-center ${user && pathname.startsWith("/dashboard") ? "text-accent-300" : "text-text-secondary"}`}>
              <UserIcon />
            </div>
            <span className={`text-[10px] font-medium ${user && pathname.startsWith("/dashboard") ? "text-accent-300" : "text-text-secondary"}`}>
              {user ? (user.firstName || "Profile") : "Sign In"}
            </span>
          </Link>
        </div>
      </nav>

      {browseOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBrowseOpen(false)} />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-surface px-6 pb-8 pt-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Browse Categories</h2>
              <button
                type="button"
                onClick={() => setBrowseOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setBrowseOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-secondary p-4 text-sm font-medium text-text-primary transition-colors hover:border-accent-300 hover:bg-accent-50"
                >
                  <cat.icon />
                  <span className="text-center text-xs">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
