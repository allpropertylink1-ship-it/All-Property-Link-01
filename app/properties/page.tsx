import type { Metadata } from "next"
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
  return <PropertiesPageClient searchParams={searchParams} />
}
