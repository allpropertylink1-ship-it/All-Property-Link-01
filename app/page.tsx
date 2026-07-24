import { cache } from "react"
import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { QuickSearch } from "@/components/home/QuickSearch"
import { FeaturedSection } from "@/components/home/FeaturedSection"
import { CTASection } from "@/components/home/CTASection"
import { ServiceCard } from "@/components/home/ServiceCard"
import { PropertyCard } from "@/components/property/PropertyCard"
import { Wrench, Briefcase } from "@/components/ui/icons"

interface ApiProperty {
  slug: string; title: string; price: number; currency: string;
  propertyType: string; listingPurpose: string | null;
  city: string; region: string; images: unknown;
  isFeatured: boolean; createdAt: string;
}

interface ApiService {
  id: string; title: string; price: string | null; currency: string;
  city: string | null; region: string | null; images: unknown;
  userId: string; categoryId: string;
  category: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string; avatar: string | null; city: string | null };
}

const fetchApi = cache(async <T,>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`https://delightful-encouragement-production-878d.up.railway.app${path}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
})

const getFeaturedProperties = cache(async () => {
  const data = await fetchApi<{ properties: ApiProperty[] }>("/api/properties?limit=6")
  return (data?.properties || []).filter(p => p.listingPurpose !== "FOR_RENT_SHORT_TERM")
})

const getFeaturedAirbnbs = cache(async () => {
  const data = await fetchApi<{ properties: ApiProperty[] }>("/api/properties?purpose=FOR_RENT_SHORT_TERM&limit=6")
  return data?.properties || []
})

const getFeaturedFundis = cache(async () => {
  const data = await fetchApi<{ services: ApiService[] }>("/api/services?type=FUNDI&limit=6")
  return (data?.services || []).filter(s => s.user)
})

const getFeaturedProviders = cache(async () => {
  const data = await fetchApi<{ services: ApiService[] }>("/api/services?type=SERVICE_PROVIDER&limit=6")
  return (data?.services || []).filter(s => s.user)
})

const getCities = cache(async () => {
  const data = await fetchApi<{ cities: { city: string; count: number }[] }>("/api/properties?limit=1")
  return data?.cities || []
})

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featuredProperties, featuredAirbnbs, featuredFundis, featuredProviders, cities] = await Promise.all([
    getFeaturedProperties(), getFeaturedAirbnbs(), getFeaturedFundis(), getFeaturedProviders(), getCities(),
  ])

  const cityItems = cities.map((c) => ({ city: c.city, _count: c.count }))

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
