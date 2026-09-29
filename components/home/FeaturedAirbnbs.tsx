"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"
import { SectionHeading } from "@/components/home/SectionHeading"

interface ApiProperty extends LatestListCardData {
  currency: string
  isFeatured: boolean
  createdAt: string | Date
  agent?: { phone?: string | null; userTypes?: string[] | null } | null
}

function listerKindOf(p: ApiProperty): "OWNER" | "AGENT" | null {
  const types = p.agent?.userTypes ?? []
  if (types.includes("AGENT")) return "AGENT"
  if (types.includes("PROPERTY_OWNER")) return "OWNER"
  return null
}

function withPhone(p: ApiProperty): LatestListCardData {
  return { ...p, agentPhone: p.agent?.phone ?? null, listerKind: listerKindOf(p) }
}

export function FeaturedAirbnbs({ initialData, error: initialError }: { initialData?: ApiProperty[]; error?: string | null }) {
  const properties = (initialData || []).slice(0, 6)
  const error = initialError ?? null

  return (
    <section aria-labelledby="home-airbnb-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="home-airbnb-heading"
            eyebrow="Short stays & getaways"
            title="Featured Airbnbs"
            subtitle="Verified stays for nights, weekends & holidays"
          />
          <Link
            href="/properties?purpose=FOR_RENT_SHORT_TERM"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Stays
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {error ? (
          <FormBanner variant="error">Could not load featured stays: {error}</FormBanner>
        ) : properties.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No short-term rentals listed yet.
          </p>
        ) : (
          <>
            {/* Mobile + tablet rail: one full card per viewport snap */}
            <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide lg:hidden">
              {properties.map((p, i) => (
                <div key={p.slug} className="w-full shrink-0 snap-start snap-always sm:w-[calc(50%-8px)]">
                  <LatestListCard item={withPhone(p)} priority={i === 0} />
                </div>
              ))}
            </div>
            {/* Desktop: 2 columns x 3 rows */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-2">
              {properties.map((p, i) => (
                <LatestListCard key={p.slug} item={withPhone(p)} priority={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
