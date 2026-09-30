"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { HeroSection } from "@/components/home/HeroSection"
import { QuickSearch } from "@/components/home/QuickSearch"
import { CategoryGrid, type CategoryInitialCounts } from "@/components/home/CategoryGrid"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import { CTASection } from "@/components/home/CTASection"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"
import { SectionHeading } from "@/components/home/SectionHeading"
import type { PropertyCard as PropertyCardType } from "@/lib/services/property"
import type { ProfileRow } from "@/components/home/ProfileCard"

function withPhone(p: PropertyCardType): LatestListCardData {
  const agent = (p as unknown as { agent?: { phone?: string | null; userTypes?: string[] | null } | null }).agent
  const types = agent?.userTypes ?? []
  const listerKind = types.includes("AGENT") ? "AGENT" : types.includes("PROPERTY_OWNER") ? "OWNER" : null
  return { ...p, agentPhone: agent?.phone ?? null, listerKind }
}

function FeaturedLand({ initialData }: { initialData?: PropertyCardType[] }) {
  const properties = (initialData || []).slice(0, 6)
  if (properties.length === 0) return null
  return (
    <section aria-labelledby="home-land-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="home-land-heading"
            eyebrow="Own a piece of Kenya"
            title="Prime Land & Development Plots"
            subtitle="Titled plots ready to build, farm or hold"
          />
          <Link
            href="/land"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Plots
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
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
      </div>
    </section>
  )
}

export function HomePageClient({
  saleRent,
  airbnbs,
  land,
  fundis,
  providers,
  initialCounts,
  initialCities,
}: {
  saleRent: PropertyCardType[];
  airbnbs: PropertyCardType[];
  land: PropertyCardType[];
  fundis: ProfileRow[];
  providers: ProfileRow[];
  initialCounts?: CategoryInitialCounts;
  initialCities?: { city: string; count: number }[];
}) {
  return (
    <>
      <HeroSection />
      <QuickSearch initialCities={initialCities} />
      <CategoryGrid initialCounts={initialCounts} />
      <FeaturedProperties initialData={saleRent} />
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedLand initialData={land} />
      <FeaturedProviders initialData={providers} />
      <FeaturedFundis initialData={fundis} servicePills={providers.slice(0, 2)} />
      <CTASection />
    </>
  )
}
