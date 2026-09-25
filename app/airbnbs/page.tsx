import type { Metadata } from "next"
import { PropertiesPageClient } from "@/components/property/PropertiesPageClient"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Airbnbs & Short-Term Stays in Kenya",
  description: "Find Airbnbs and vacation rentals in Kenya. Browse short-term stays in Diani, Naivasha, Nyahururu and beyond — book by the night.",
  alternates: { canonical: "/airbnbs" },
}

export default function AirbnbsPage() {
  return (
    <PropertiesPageClient
      searchParams={{
        purpose: "FOR_RENT_SHORT_TERM",
        limit: "20",
      }}
    />
  )
}