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
  const [latest, airbnbs, land, featured, fundis, providers] = await Promise.all([
    // Newest across ALL property types. The shelf's own `isSaleOrRent` filter
    // drops LAND (~12% of stock) and short-term stays, so roughly 72% of a page
    // survives — 24 rows reliably fills the 6 slots. This used to be narrowed to
    // type=HOUSE on the theory that an unfiltered fetch "returns mostly LAND",
    // which is no longer true: apartments are now the largest category on the
    // platform (679 apartments vs 642 houses), so narrowing to HOUSE hid the
    // majority of everything users were newly listing.
    getProperties({ pageSize: 24 }),
    getProperties({ purpose: "FOR_RENT_SHORT_TERM", pageSize: 8 }),
    getProperties({ propertyType: "LAND", pageSize: 8 }),
    // Paid placement. `?featured=1` is already bounded on an unexpired
    // featuredUntil server-side, so no client-side decay check is needed here.
    getProperties({ featured: true, pageSize: 6 }),
    getServiceListings({ type: "FUNDI", limit: "6" }),
    getServiceListings({ type: "SERVICE_PROVIDER", limit: "6" }),
  ])

  const fundiRows = toProfileRows(fundis.services);
  const fundiIds = new Set(fundiRows.map((s) => s.id));
  // BOTH-type shelves match both rails — drop cross-rail duplicates so the
  // same pro never appears twice on the homepage.
  const providerRows = toProfileRows(providers.services).filter((s) => !fundiIds.has(s.id));

  return (
    <HomePageClient
      featured={featured.properties}
      latest={latest.properties}
      airbnbs={airbnbs.properties}
      land={land.properties}
      fundis={fundiRows}
      providers={providerRows}
      fundiCount={fundis.total}
      providerCount={providers.total}
      // `latest` is the unfiltered query, so its total IS the platform-wide
      // published count. Summing the shelf totals (the old
      // saleRent + airbnbs + land) double-counted every LAND and short-term
      // listing, which each appear in `latest` *and* in their own shelf.
      propertyCount={latest.total}
    />
  )
}
