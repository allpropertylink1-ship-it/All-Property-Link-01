"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { HeroSection } from "@/components/home/HeroSection"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import { CTASection } from "@/components/home/CTASection"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"
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
          <h2 id="home-land-heading" className="font-poppins text-[28px] font-semibold leading-tight tracking-tight text-text-primary sm:text-[32px]">
            Prime Land &amp; Development Plots
          </h2>
          <Link
            href="/land"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Plots
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {/* Mobile + tablet rail: horizontal snap scroll */}
        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide lg:hidden">
          {properties.map((p, i) => (
                <div key={p.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%]">
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
}: {
  saleRent: PropertyCardType[];
  airbnbs: PropertyCardType[];
  land: PropertyCardType[];
  fundis: ProfileRow[];
  providers: ProfileRow[];
}) {
  return (
    <>
      <HeroSection />
      <FeaturedProperties initialData={saleRent} />
      <FeaturedLand initialData={land} />
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedFundis initialData={fundis} servicePills={providers.slice(0, 2)} />
      <FeaturedProviders initialData={providers} />
      <CTASection />
    </>
  )
}
