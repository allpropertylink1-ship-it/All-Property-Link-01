"use client";

import Link from "next/link";

export interface Hotspot {
  label: string;
  href: string;
  active: boolean;
}

export function HotspotPills({ hotspots }: { hotspots: Hotspot[] }) {
  if (hotspots.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
      <span className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Hotspots:
      </span>
      <div className="flex items-center gap-2" role="group" aria-label="Property hotspots">
        {hotspots.map((h) =>
          h.active ? (
            <span
              key={h.label}
              aria-current="true"
              className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full bg-primary px-4 text-sm font-medium text-white shadow-sm"
            >
              {h.label}
            </span>
          ) : (
            <Link
              key={h.label}
              href={h.href}
              className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full bg-surface-secondary px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary/70"
            >
              {h.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
