/* eslint-disable @next/next/no-img-element -- upload thumbs are served direct (unoptimized) via the /uploads proxy */
import type { Metadata } from "next";
import Link from "next/link";
import { getArchiveProperties } from "@/lib/services/property";
import { slugifyCity } from "@/lib/seo";
import { PLACEHOLDER_PROPERTY } from "@/lib/placeholders";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Archive — Sold &amp; Rented Properties",
    description: "Properties that are no longer available because they have been sold or rented.",
    // Sold/rented listings are historical records; keep them out of search results
    // so active inventory isn't diluted by unavailable homes.
    robots: { index: false, follow: false },
  };
}

function statusBadge(status: string | null | undefined): { label: string; color: string } | null {
  const s = (status || "").toUpperCase()
  if (s === "SOLD") return { label: "Sold", color: "bg-rose-600" }
  if (s === "RENTED") return { label: "Rented", color: "bg-amber-600" }
  return null
}

function soldAtLabel(p: { soldAt?: Date | null; status?: string }): string | null {
  if (!p.soldAt) return null
  try {
    return new Date(p.soldAt).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric",
    })
  } catch { return null }
}

export default async function ArchivePage() {
  const { properties, total } = await getArchiveProperties()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">Archive — Sold &amp; Rented</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {total} property{total === 1 ? "" : "s"} that are no longer available because they were sold or rented.
          Detail pages for these listings remain accessible but are de-indexed.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.length === 0 ? (
          <p className="col-span-full text-center py-12 text-text-secondary">No archived properties yet.</p>
        ) : (
          properties.map((p) => {
            const badge = statusBadge(p.status)
            const isLand = (p.propertyType || "").toUpperCase() === "LAND"
            const detailBase = isLand ? "/land" : "/properties"
            return (
              <Link
                key={p.id}
                href={`${detailBase}/${slugifyCity(p.city)}/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="relative w-full overflow-hidden">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-secondary">
                    <img
                      src={p.coverImage ?? PLACEHOLDER_PROPERTY}
                      alt={p.title}
                      className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = PLACEHOLDER_PROPERTY
                      }}
                    />
                    {badge && (
                      <span className={`absolute left-1.5 top-1.5 z-10 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                    {p.soldAt && (
                      <span className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-text-secondary shadow-sm backdrop-blur-sm">
                        {soldAtLabel(p)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 min-w-0 flex-1 break-words font-heading text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-600 sm:text-[15px]">
                      {p.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-secondary py-1 text-center text-xs text-text-secondary">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide">Type</span>
                      <span className="font-heading text-[13px] font-bold capitalize text-text-primary">{p.propertyType.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide">Status</span>
                      <span className="font-heading text-[13px] font-bold text-text-primary capitalize">{badge ? badge.label : p.listingPurpose ?? "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide">Location</span>
                      <span className="font-heading text-[13px] font-bold text-text-primary">{p.city}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <nav className="mt-8 flex items-center justify-between text-sm text-text-secondary">
        <Link href="/properties" className="touch-target inline-flex items-center gap-1 transition-colors hover:text-primary">
          ← Browse available properties
        </Link>
      </nav>
    </div>
  );
}
