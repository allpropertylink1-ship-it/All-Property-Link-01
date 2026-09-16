"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { QuickSearch } from "@/components/home/QuickSearch"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import { CTASection } from "@/components/home/CTASection"
import { PropertyCard } from "@/components/property/PropertyCard"
import type { PropertyCard as PropertyCardType } from "@/lib/services/property"
import type { ProfileRow } from "@/components/home/ProfileCard"

function FeaturedLand({ initialData }: { initialData?: PropertyCardType[] }) {
  if (!initialData || initialData.length === 0) return null
  return (
    <section aria-labelledby="home-land-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="home-land-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Prime Land &amp; Development Plots
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-secondary">Filter by:</span>
            <Link
              href="/land"
              className="flex min-h-touch items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-text-onPrimary"
            >
              Ready Titles
            </Link>
            <Link
              href="/land?search=gated"
              className="flex min-h-touch items-center rounded-lg bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-primary/5 hover:text-primary"
            >
              Gated Plots
            </Link>
            <Link
              href="/land"
              className="inline-flex min-h-touch items-center gap-1.5 px-1 text-sm font-bold text-primary transition-colors hover:text-accent-600"
            >
              View All Plots
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
          {initialData.map((p, i) => (
            <div key={p.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
            <PropertyCard
              slug={p.slug}
              title={p.title}
              price={p.price == null ? null : Number(p.price)}
              currency={p.currency}
              propertyType={p.propertyType}
              listingPurpose={p.listingPurpose}
              city={p.city}
              region={p.region}
              images={p.images}
              coverImage={p.coverImage ?? null}
              isFeatured={p.isFeatured}
              bedrooms={p.bedrooms}
              bathrooms={p.bathrooms}
              area={p.area}
              priority={i === 0}
            />
            </div>
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
      <CategoryGrid />
      <QuickSearch />
      <FeaturedProperties initialData={saleRent} />
      <FeaturedLand initialData={land} />
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedFundis initialData={fundis} servicePills={providers.slice(0, 2)} />
      <FeaturedProviders initialData={providers} />
      <CTASection />
    </>
  )
}
