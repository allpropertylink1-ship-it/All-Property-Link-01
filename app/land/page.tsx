import type { Metadata } from "next"
import { PropertiesPageClient } from "@/components/property/PropertiesPageClient"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Plots & Land for Sale in Kenya",
  description: "Browse plots and land for sale across Kenya. Find empty plots, agricultural land, and commercial plots in your preferred location.",
  alternates: { canonical: "/land" },
}

export default function LandPage() {
  return (
    <PropertiesPageClient
      searchParams={{
        propertyType: "LAND",
        limit: "20",
      }}
    />
  )
}