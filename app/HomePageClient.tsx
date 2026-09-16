"use client"

import Link from "next/link"
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
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
              100% Surveyed &amp; Title Deed Ready
            </p>
            <h2 id="home-land-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Prime Land &amp; Development Plots
            </h2>
            <p className="mt-1 max-w-text text-sm text-text-secondary">
              Pre-searched land parcels in Kenya&apos;s fastest capital appreciation growth corridors.
            </p>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3">
          {initialData.map((p, i) => (
            <PropertyCard
              key={p.slug}
              slug={p.slug}
              title={p.title}
              price={p.price == null ? null : Number(p.price)}
              currency={p.currency}
              propertyType={p.propertyType}
              listingPurpose={p.listingPurpose}
              city={p.city}
              region={p.region}
              images={p.images}
              isFeatured={p.isFeatured}
              bedrooms={null}
              bathrooms={null}
              area={null}
              priority={i === 0}
            />
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
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedFundis initialData={fundis} />
      <FeaturedLand initialData={land} />
      <FeaturedProviders initialData={providers} />
      <CTASection />
    </>
  )
}
