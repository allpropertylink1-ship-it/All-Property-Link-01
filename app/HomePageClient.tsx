"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { QuickSearch } from "@/components/home/QuickSearch"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"
import type { PropertyCard } from "@/lib/services/property"
import type { ProfileRow } from "@/components/home/ProfileCard"

export function HomePageClient({
  saleRent,
  airbnbs,
  fundis,
  providers,
}: {
  saleRent: PropertyCard[];
  airbnbs: PropertyCard[];
  fundis: ProfileRow[];
  providers: ProfileRow[];
}) {
  const router = useRouter()

  useEffect(() => {
    const seen = localStorage.getItem("splash_seen_v1")
    const now = Date.now()
    if (!seen || now - parseInt(seen) > 24 * 60 * 60 * 1000) {
      router.push("/splash")
    }
  }, [router])

  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <QuickSearch />
      <FeaturedProperties initialData={saleRent} />
      <FeaturedAirbnbs initialData={airbnbs} />
      <FeaturedFundis initialData={fundis} />
      <FeaturedProviders initialData={providers} />
    </>
  )
}