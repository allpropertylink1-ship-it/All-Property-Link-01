"use client";

import Link from "next/link";

interface Shelf {
  id: string;
  name: string;
  slug?: string;
}

/**
 * Single-listing plan: shelves are read-only and mirror the provider's
 * business-profile specialties. Edits happen under Business Profile, which
 * immediately re-syncs the one ACTIVE listing server-side.
 */
export default function SyncedShelvesNotice({ shelves }: { shelves: Shelf[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary/40 p-4">
      <p className="text-sm font-medium text-text-primary">
        Sectors & Categories{" "}
        <span className="font-normal text-text-secondary">
          (synced from your specialties — one listing covers them all)
        </span>
      </p>
      {shelves.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Synced specialties">
          {shelves.map((s) => (
            <li
              key={s.id}
              className="inline-flex items-center rounded-full bg-primary-600/10 px-3 py-1 text-xs font-medium text-primary-700"
            >
              {s.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-secondary" role="status">
          No specialties yet — add at least one specialty first.
        </p>
      )}
      <p className="mt-3 text-xs text-text-secondary">
        To add or remove a specialty, update your{" "}
        <Link href="/dashboard/profile/business" className="font-medium text-primary-600 hover:text-primary-700">
          Business Profile
        </Link>
        . Your listing updates automatically. You can still set a price per specialty below.
      </p>
    </div>
  );
}
