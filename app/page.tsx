import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { QuickSearch } from "@/components/home/QuickSearch"
import { FeaturedSection } from "@/components/home/FeaturedSection"
import { CTASection } from "@/components/home/CTASection"
import { ServiceCard } from "@/components/home/ServiceCard"
import { PropertyCard } from "@/components/property/PropertyCard"
import { Wrench, Briefcase } from "@/components/ui/icons"

const getFeaturedProperties = cache(async () =>
  prisma.property.findMany({
    where: { deletedAt: null, listingPurpose: { not: "FOR_RENT_SHORT_TERM" } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: { slug: true, title: true, price: true, currency: true, propertyType: true, listingPurpose: true, city: true, region: true, images: true, isFeatured: true, createdAt: true },
  })
)

const getFeaturedAirbnbs = cache(async () =>
  prisma.property.findMany({
    where: { deletedAt: null, listingPurpose: "FOR_RENT_SHORT_TERM" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: { slug: true, title: true, price: true, currency: true, propertyType: true, listingPurpose: true, city: true, region: true, images: true, isFeatured: true, createdAt: true },
  })
)

const getFeaturedFundis = cache(async () =>
  prisma.serviceListing.findMany({
    where: { status: "ACTIVE", moderationStatus: "APPROVED", user: { userTypes: { has: "FUNDI" } } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, price: true, currency: true, city: true, region: true, images: true, userId: true, categoryId: true, category: { select: { id: true, name: true } }, user: { select: { id: true, firstName: true, lastName: true, avatar: true, city: true } } },
  })
)

const getFeaturedProviders = cache(async () =>
  prisma.serviceListing.findMany({
    where: { status: "ACTIVE", moderationStatus: "APPROVED", user: { userTypes: { has: "SERVICE_PROVIDER" } } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, price: true, currency: true, city: true, region: true, images: true, userId: true, categoryId: true, category: { select: { id: true, name: true } }, user: { select: { id: true, firstName: true, lastName: true, avatar: true, city: true } } },
  })
)

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featuredProperties, featuredAirbnbs, featuredFundis, featuredProviders, cities] = await Promise.all([
    getFeaturedProperties(), getFeaturedAirbnbs(), getFeaturedFundis(), getFeaturedProviders(),
    prisma.property.groupBy({ by: ["city"], where: { deletedAt: null }, _count: { city: true }, orderBy: { city: "asc" } }),
  ])

  const cityItems = cities.map((c) => ({ city: c.city, _count: c._count.city }))

  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <QuickSearch cities={cityItems} />
      <FeaturedSection title="Properties for Sale & Rent" viewAllHref="/properties">
        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.slug} slug={p.slug} title={p.title} price={Number(p.price)} currency={p.currency}
                propertyType={p.propertyType} listingPurpose={p.listingPurpose} city={p.city} region={p.region}
                images={p.images} isFeatured={p.isFeatured} bedrooms={null} bathrooms={null} area={null} />
            ))}
          </div>
        ) : <p className="py-8 text-center text-sm text-muted">No properties listed yet.</p>}
      </FeaturedSection>
      <FeaturedSection title="Airbnbs & Short-term Stays" viewAllHref="/properties?purpose=FOR_RENT_SHORT_TERM">
        {featuredAirbnbs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAirbnbs.map((p) => (
              <PropertyCard key={p.slug} slug={p.slug} title={p.title} price={Number(p.price)} currency={p.currency}
                propertyType={p.propertyType} listingPurpose={p.listingPurpose} city={p.city} region={p.region}
                images={p.images} isFeatured={p.isFeatured} bedrooms={null} bathrooms={null} area={null} />
            ))}
          </div>
        ) : <p className="py-8 text-center text-sm text-muted">No short-term rentals listed yet.</p>}
      </FeaturedSection>
      <FeaturedSection title="Fundis Near You" viewAllHref="/services">
        {featuredFundis.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredFundis.map((s) => <ServiceCard key={s.id} item={s} icon={Wrench} />)}
          </div>
        ) : <p className="py-8 text-center text-sm text-muted">No fundis listed yet.</p>}
      </FeaturedSection>
      <FeaturedSection title="Service Providers" viewAllHref="/services">
        {featuredProviders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProviders.map((s) => <ServiceCard key={s.id} item={s} icon={Briefcase} />)}
          </div>
        ) : <p className="py-8 text-center text-sm text-muted">No service providers yet.</p>}
      </FeaturedSection>
      <CTASection />
    </>
  )
}
