import type { Metadata } from "next"
import { LandPageClient } from "@/components/property/LandPageClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Land & Plots for Sale in Kenya",
  description: "Browse residential plots, farmland and commercial land for sale across Kenya. Connect directly with verified agents and land owners.",
  alternates: { canonical: "/land" },
}

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default function LandPage({ searchParams }: Props) {
  return <LandPageClient searchParams={searchParams} />
}
