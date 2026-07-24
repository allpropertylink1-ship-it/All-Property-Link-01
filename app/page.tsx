import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { QuickSearch } from "@/components/home/QuickSearch"
import { CTASection } from "@/components/home/CTASection"
import { FeaturedProperties } from "@/components/home/FeaturedProperties"
import { FeaturedAirbnbs } from "@/components/home/FeaturedAirbnbs"
import { FeaturedFundis } from "@/components/home/FeaturedFundis"
import { FeaturedProviders } from "@/components/home/FeaturedProviders"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <QuickSearch />
      <FeaturedProperties />
      <FeaturedAirbnbs />
      <FeaturedFundis />
      <FeaturedProviders />
      <CTASection />
    </>
  )
}
