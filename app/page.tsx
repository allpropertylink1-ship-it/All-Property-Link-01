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
  const [saleRent, airbnbs, fundis, providers] = await Promise.all([
    getProperties({ pageSize: 6 }),
    getProperties({ purpose: "FOR_RENT_SHORT_TERM", pageSize: 6 }),
    getServiceListings({ type: "FUNDI", limit: "6" }),
    getServiceListings({ type: "SERVICE_PROVIDER", limit: "6" }),
  ])

  return (
    <HomePageClient
      saleRent={saleRent.properties}
      airbnbs={airbnbs.properties}
      fundis={toProfileRows(fundis.services)}
      providers={toProfileRows(providers.services)}
    />
  )
}