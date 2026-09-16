import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"
import { PropertiesPageClient } from "@/components/property/PropertiesPageClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Properties for Sale & Rent in Kenya",
  description: "Browse houses, apartments, land and commercial properties for sale or rent across Kenya. Connect directly with verified agents and property owners.",
  alternates: { canonical: "/properties" },
}

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default function PropertiesPage({ searchParams }: Props) {
  // Land lives at /land now — forward legacy land-filter URLs, keeping
  // the other filters (city, price, bedrooms, page).
  if (searchParams.type === "LAND" || searchParams.propertyType === "LAND") {
    const params = new URLSearchParams()
    if (searchParams.city) params.set("city", searchParams.city)
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice)
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice)
    if (searchParams.bedrooms) params.set("bedrooms", searchParams.bedrooms)
    if (searchParams.page) params.set("page", searchParams.page)
    const qs = params.toString()
    permanentRedirect(qs ? `/land?${qs}` : "/land")
  }
  return <PropertiesPageClient searchParams={searchParams} />
}
