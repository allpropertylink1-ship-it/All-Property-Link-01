import type { Metadata } from "next"
import { HomePageClient } from "./HomePageClient"
import { getProperties } from "@/lib/services/property"
import { getServiceListings, type ServiceListingCard } from "@/lib/services/service"
import type { ProfileRow } from "@/components/home/ProfileCard"

export const revalidate = 60

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

function toProfileRows(services: ServiceListingCard[]): ProfileRow[] {
  return services
    .filter((s) => !!s.user)
    .map((s) => ({ ...s, user: { ...s.user!, id: s.userId } }))
}

export default async function HomePage() {
  // Server-side fetches cached by ISR (revalidate: 60) — embedded in HTML so
  // the browser renders cards immediately instead of a client-side waterfall.
  const [saleRent, airbnbs, land, fundis, providers, saleCount, rentCount] = await Promise.all([
    // NOTE: unfiltered fetch returns mostly LAND (seed-heavy), which this
    // section filters out — so source HOUSE directly (632 live) to fill 2 rows.
    getProperties({ propertyType: "HOUSE", pageSize: 12 }),
    getProperties({ purpose: "FOR_RENT_SHORT_TERM", pageSize: 8 }),
    getProperties({ propertyType: "LAND", pageSize: 8 }),
    getServiceListings({ type: "FUNDI", limit: "6" }),
    getServiceListings({ type: "SERVICE_PROVIDER", limit: "6" }),
    // Lightweight count-only fetches (limit=1) for CategoryGrid pills.
    getProperties({ purpose: "FOR_SALE", pageSize: 1 }),
    getProperties({ purpose: "FOR_RENT_LONG_TERM", pageSize: 1 }),
  ])

  return (
    <HomePageClient
      saleRent={saleRent.properties}
      airbnbs={airbnbs.properties}
      land={land.properties}
      fundis={toProfileRows(fundis.services)}
      providers={toProfileRows(providers.services)}
      initialCounts={{
        sale: saleCount.total,
        rent: rentCount.total,
        airbnb: airbnbs.total,
        land: land.total,
        fundi: fundis.total,
        provider: providers.total,
      }}
    />
  )
}