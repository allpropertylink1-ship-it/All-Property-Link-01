"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const baseItems = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg className={active ? "text-accent-300" : "text-text-secondary"} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/properties",
    label: "Search",
    icon: (active: boolean) => (
      <svg className={active ? "text-accent-300" : "text-text-secondary"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Profile",
    icon: (active: boolean) => (
      <svg className={active ? "text-accent-300" : "text-text-secondary"} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const agentItem = {
  href: "/dashboard/agent",
  label: "Agent",
  icon: (active: boolean) => (
    <svg className={active ? "text-accent-300" : "text-text-secondary"} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
};

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = user?.authMethod === "agent" ? [...baseItems, agentItem] : baseItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2"
            >
              <div className="flex h-6 w-6 items-center justify-center">
                {item.icon(active)}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-accent-300" : "text-text-secondary"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
