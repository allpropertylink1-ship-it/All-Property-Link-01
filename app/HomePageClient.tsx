"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { HeroSection } from "@/components/home/HeroSection"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import { CTASection } from "@/components/home/CTASection"
import { ProviderCTASection } from "@/components/home/ProviderCTASection"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"
import { SectionHeading } from "@/components/home/SectionHeading"
import { useCoverBackdrop } from "@/components/home/useCoverBackdrop"
import { useRailScrollBackdrop } from "@/components/home/useRailScrollBackdrop"
import { getCoverImage } from "@/lib/images"
import type { PropertyCard as PropertyCardType } from "@/lib/services/property"
import type { ProfileRow } from "@/components/home/ProfileCard"

function withPhone(p: PropertyCardType): LatestListCardData {
  const agent = p.agent
  const types = agent?.userTypes ?? []
  const listerKind = types.includes("AGENT") ? "AGENT" : types.includes("PROPERTY_OWNER") ? "OWNER" : null
  return { ...p, agentPhone: agent?.phone ?? null, listerKind, listerViews: agent?.totalViews ?? null }
}

/**
 * Paid-featured placement. Fed by `?featured=1`, which the API already bounds
 * on an unexpired `featuredUntil`, so this is a pure render — no client
 * fallback fetch. Renders nothing when the platform has no live placement
 * (the flag is admin-set, so that is the normal state at launch).
 */
function FeaturedStrip({ initialData }: { initialData?: PropertyCardType[] }) {
  const properties = (initialData || []).filter((p) => p.isFeatured).slice(0, 6)
  const { activeImage, prevImage, onImageEnter, onImageLeave } = useCoverBackdrop()

  const coverImages = properties
    .map((p) => getCoverImage({ coverImage: p.coverImage, images: p.images }))
    .filter((u): u is string => !!u)

  const railRef = useRailScrollBackdrop(coverImages, onImageEnter)

  if (properties.length === 0) return null

  return (
    <section aria-labelledby="home-featured-heading" className="relative">
      {!activeImage && !prevImage && <div className="absolute inset-0 z-0 bg-surface" />}
      {prevImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500 ease-out opacity-0"
          style={{ backgroundImage: `url(${prevImage})`, filter: 'blur(24px) saturate(0.85)' }}
          aria-hidden="true"
        />
      )}
      {activeImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500 ease-out opacity-100"
          style={{ backgroundImage: `url(${activeImage})`, filter: 'blur(24px) saturate(0.85)' }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 z-10 bg-black/15" aria-hidden="true" />
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <SectionHeading
          id="home-featured-heading"
          eyebrow="Promoted"
          title="Featured Listings"
          subtitle="Premium placements selected by the All Property Link team"
        />
        {/* Mobile rail: scroll drives the backdrop automatically */}
        <div ref={railRef} className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:hidden">
          {properties.map((p, i) => (
            <div key={p.slug} className="w-full shrink-0 snap-start snap-always sm:w-[calc(50%-8px)]">
              <LatestListCard item={withPhone(p)} priority={i === 0} onImageEnter={onImageEnter} onImageLeave={onImageLeave} />
            </div>
          ))}
        </div>
        {/* Desktop grid: hover drives the backdrop */}
        <div className="mt-4 hidden gap-4 lg:grid lg:grid-cols-2">
          {properties.map((p, i) => (
            <LatestListCard key={p.slug} item={withPhone(p)} priority={i === 0} onImageEnter={onImageEnter} onImageLeave={onImageLeave} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedLand({ initialData }: { initialData?: PropertyCardType[] }) {
  const properties = (initialData || []).slice(0, 6)
  const { activeImage, prevImage, onImageEnter, onImageLeave } = useCoverBackdrop()

  const coverImages = properties
    .map((p) => getCoverImage({ coverImage: p.coverImage, images: p.images }))
    .filter((u): u is string => !!u)

  const railRef = useRailScrollBackdrop(coverImages, onImageEnter)

  if (properties.length === 0) return null

  return (
    <section aria-labelledby="home-land-heading" className="relative">
      {!activeImage && !prevImage && <div className="absolute inset-0 z-0 bg-surface" />}
      {prevImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500 ease-out opacity-0"
          style={{ backgroundImage: `url(${prevImage})`, filter: 'blur(24px) saturate(0.85)' }}
          aria-hidden="true"
        />
      )}
      {activeImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500 ease-out opacity-100"
          style={{ backgroundImage: `url(${activeImage})`, filter: 'blur(24px) saturate(0.85)' }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 z-10 bg-black/15" aria-hidden="true" />
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
        {/* Mobile rail: scroll drives the backdrop automatically */}
        <div ref={railRef} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:hidden">
          {properties.map((p, i) => (
                <div key={p.slug} className="w-full shrink-0 snap-start snap-always sm:w-[calc(50%-8px)]">
                  <LatestListCard item={withPhone(p)} priority={i === 0} onImageEnter={onImageEnter} onImageLeave={onImageLeave} />
                </div>
          ))}
        </div>
            {/* Desktop grid: hover drives the backdrop */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-2">
              {properties.map((p, i) => (
                <LatestListCard key={p.slug} item={withPhone(p)} priority={i === 0} onImageEnter={onImageEnter} onImageLeave={onImageLeave} />
              ))}
            </div>
      </div>
    </section>
  )
}

export function HomePageClient({
  featured,
  latest,
  airbnbs,
  land,
  fundis,
  providers,
  fundiCount,
  providerCount,
  propertyCount,
}: {
  featured: PropertyCardType[];
  latest: PropertyCardType[];
  airbnbs: PropertyCardType[];
  land: PropertyCardType[];
  fundis: ProfileRow[];
  providers: ProfileRow[];
  fundiCount: number;
  providerCount: number;
  propertyCount: number;
}) {
  return (
    <>
      <HeroSection />
      <FeaturedStrip initialData={featured} />
      <FeaturedProperties initialData={latest} />
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedLand initialData={land} />
      <FeaturedProviders initialData={providers} />
      <FeaturedFundis initialData={fundis} />
      <ProviderCTASection
        fundiCount={fundiCount}
        providerCount={providerCount}
        propertyCount={propertyCount}
      />
      <CTASection />
    </>
  )
}
