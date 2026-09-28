"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"

interface ApiProperty extends LatestListCardData {
  currency: string
  isFeatured: boolean
  createdAt: string | Date
}

export function FeaturedAirbnbs({ initialData, error: initialError }: { initialData?: ApiProperty[]; error?: string | null }) {
  const properties = (initialData || []).slice(0, 6)
  const error = initialError ?? null

  return (
    <section aria-labelledby="home-airbnb-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 id="home-airbnb-heading" className="font-poppins text-[40px] font-normal leading-10 tracking-[-1px] text-text-primary">
          Featured Airbnbs
        </h2>
        <div className="mb-10 mt-8 flex items-center justify-end">
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
            {/* Mobile + tablet rail: horizontal snap scroll */}
            <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide lg:hidden">
              {properties.map((p, i) => (
                <div key={p.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%]">
                  <LatestListCard item={p} priority={i === 0} />
                </div>
              ))}
            </div>
            {/* Desktop: 2 columns x 3 rows */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-2">
              {properties.map((p, i) => (
                <LatestListCard key={p.slug} item={p} priority={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
