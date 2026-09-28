"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { HeroSection } from "@/components/home/HeroSection"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import { CTASection } from "@/components/home/CTASection"
import { LatestListCard } from "@/components/home/LatestListCard"
import type { PropertyCard as PropertyCardType } from "@/lib/services/property"
import type { ProfileRow } from "@/components/home/ProfileCard"

function FeaturedLand({ initialData }: { initialData?: PropertyCardType[] }) {
  const properties = (initialData || []).slice(0, 6)
  if (properties.length === 0) return null
  return (
    <section aria-labelledby="home-land-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 id="home-land-heading" className="font-poppins text-[40px] font-normal leading-10 tracking-[-1px] text-text-primary">
          Prime Land &amp; Development Plots
        </h2>
        <div className="mb-10 mt-8 flex items-center justify-end">
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
