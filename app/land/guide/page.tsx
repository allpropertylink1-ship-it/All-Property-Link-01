import type { Metadata } from "next"
import { FAQSchema } from "@/components/faq/FAQSchema"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Buying Land in Kenya: Guide & Due Diligence Checklist",
  description: "Everything you need to know before buying land in Kenya — types of land, popular locations, title verification, and due diligence checklist.",
  alternates: { canonical: "/land/guide" },
}

const GUIDE_CONTENT = {
  title: "Buying Land in Kenya",
  intro: "Buying land in Kenya is a popular investment strategy. From residential plots in Nairobi's satellite towns to agricultural land in the countryside, All Property Link helps you find titled land with verified ownership.",
  sections: [
    {
      heading: "Types of Land Available",
      content: "We list residential plots for building homes, agricultural land for farming, commercial plots for business development, and empty plots in gated communities. Each listing includes location, plot size, title deed type, and asking price.",
    },
    {
      heading: "Popular Land Locations",
      content: "Nairobi's satellite towns (Ruaka, Kamakis, Kangundo Road) offer residential plots. Kiambu, Machakos, and Kajiado have agricultural land. Coastal areas like Kilifi and Malindi have beachfront plots. All listings include GPS coordinates and survey maps where available.",
    },
    {
      heading: "Due Diligence Checklist",
      content: "Before buying land: conduct a land search at the Ministry of Lands, verify the title deed is genuine, check for encumbrances or caveats, confirm the seller's identity, and ensure rates and land rent are paid up to date. Always involve a lawyer in land transactions.",
    },
  ],
}

export default function LandGuidePage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-h1 text-text-primary sm:text-4xl">
            {GUIDE_CONTENT.title}
          </h1>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed max-w-2xl">
            {GUIDE_CONTENT.intro}
          </p>
        </div>
        <div className="space-y-6">
          {GUIDE_CONTENT.sections.map((section, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                {section.heading}
              </h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
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
        pageTitle="Buying Land in Kenya FAQ"
        pageUrl="https://www.allpropertylink.co.ke/land/guide"
      />
    </>
  )
}
