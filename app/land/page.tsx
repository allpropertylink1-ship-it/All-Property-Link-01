import type { Metadata } from "next"
import Link from "next/link"
import { PropertiesPageClient } from "@/components/property/PropertiesPageClient"
import { FAQSchema } from "@/components/faq/FAQSchema"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Plots & Land for Sale in Kenya",
  description: "Browse plots and land for sale across Kenya. Find empty plots, agricultural land, and commercial plots in your preferred location.",
  alternates: { canonical: "/land" },
}

export default function LandPage() {
  return (
    <>
      <PropertiesPageClient
        basePath="/land"
        searchParams={{
          propertyType: "LAND",
          limit: "20",
        }}
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-h1 text-text-primary sm:text-4xl">
            Land & Plots for Sale in Kenya
          </h1>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Browse titled land and plots across Kenya — residential, agricultural, commercial, and gated-community plots with verified ownership.
          </p>
          <p className="mt-3 text-text-secondary">
            Need help before buying? Read our{" "}
            <Link
              href="/land/guide"
              className="text-teal-600 hover:underline font-medium"
            >
              buying land in Kenya guide & due diligence checklist
            </Link>
            .
          </p>
        </div>
      </section>
      <FAQSchema
        faqs={[
          {
            question: "What types of land are available?",
            answer: "We list residential plots, agricultural land, commercial plots, and development land across Kenya — from Nairobi suburbs to emerging towns.",
          },
          {
            question: "How do I verify a land title?",
            answer: "Conduct a land search at the Ministry of Lands to confirm ownership and check for encumbrances. Always verify the title deed before making any payment.",
          },
          {
            question: "What costs are involved in buying land?",
            answer: "Budget for stamp duty (4% urban / 2% rural), legal fees (~1-2%), search fees, and transfer costs. Always factor these into your total budget.",
          },
          {
            question: "Can I build on any plot?",
            answer: "No. Check zoning regulations and land use restrictions with the county government before building. Some plots are residential-only, others allow commercial or mixed-use.",
          },
        ]}
        pageTitle="Land & Plots FAQ"
        pageUrl="https://www.allpropertylink.co.ke/land"
      />
    </>
  )
}