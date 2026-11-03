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

const CATEGORY_CONTENT = {
  FOR_SALE: {
    title: "Properties for Sale in Kenya",
    intro: "Buying property in Kenya is one of the most important financial decisions you'll make. Whether you're looking for a family home in Nairobi, an apartment in Kilimani, or a plot of land in Kiambu, All Property Link connects you with verified agents and property owners across the country.",
    sections: [
      {
        heading: "Why Buy Property in Kenya?",
        content: "Kenya's real estate market has shown steady growth over the past decade. With urbanization, infrastructure development, and a growing middle class, property ownership remains one of the most reliable ways to build long-term wealth. From luxury homes in Karen to affordable apartments in Ruaka, there's something for every budget.",
      },
      {
        heading: "Popular Locations for Sale",
        content: "Nairobi leads the market with neighborhoods like Westlands, Lavington, Kileleshwa, and Karen offering premium properties. Emerging areas like Ruaka, Kamakis, and Ongata Rongai provide more affordable entry points. Outside Nairobi, Mombasa (Nyali, Bamburi), Nakuru, and Kisumu are popular for both residential and investment purchases.",
      },
      {
        heading: "What to Check Before Buying",
        content: "Always verify the agent's credentials, visit the property in person, confirm ownership documents at the Ministry of Lands, check for outstanding utility bills, and read the sale agreement carefully. We recommend using a qualified lawyer for all property purchases.",
      },
    ],
  },
  FOR_RENT_LONG_TERM: {
    title: "Properties for Rent in Kenya",
    intro: "Renting in Kenya offers flexibility for expats, professionals, and families. From furnished apartments in Westlands to family homes in Karen, find long-term rental properties across Kenya's top towns.",
    sections: [
      {
        heading: "Why Rent in Kenya?",
        content: "Renting is ideal if you're new to a city, on a short-term assignment, or prefer not to commit to a mortgage. With rental properties across all major Kenyan towns, you can find options that match your budget and lifestyle without the upfront costs of buying.",
      },
      {
        heading: "Popular Rental Locations",
        content: "Westlands and Kilimani are popular with expats and young professionals. Karen, Lavington, and Runda offer spacious family homes. For more affordable options, consider Ruaka, Kasarani, and Ongata Rongai. Coastal towns like Mombasa and Malindi also have strong rental markets.",
      },
      {
        heading: "What to Check Before Renting",
        content: "Confirm the deposit amount (typically 1-2 months), understand what's included in the rent (water, electricity, parking), verify the landlord's ownership, and get a written lease agreement. Always inspect the property in person before signing.",
      },
    ],
  },
  FOR_RENT_SHORT_TERM: {
    title: "Short-Term Rentals & Airbnb in Kenya",
    intro: "Short-term rentals and Airbnb-style stays are perfect for tourists, business travelers, and anyone needing flexible accommodation. Find verified short-stay properties in Nairobi, Mombasa, Naivasha, and beyond.",
    sections: [
      {
        heading: "Why Choose Short-Term Rentals?",
        content: "Short-term rentals offer the comfort of home with the flexibility of a hotel. Whether you're in Nairobi for business, Mombasa for a beach holiday, or Naivasha for a weekend getaway, you'll find fully furnished properties with WiFi, kitchens, and all the amenities you need.",
      },
      {
        heading: "Popular Short-Term Locations",
        content: "Westlands and Kilimani are top choices for business travelers. Nyali and Diani Beach are perfect for beach holidays. Naivasha and Nakuru offer scenic getaways close to nature. Most properties offer weekly or monthly rates with flexible check-in/check-out.",
      },
      {
        heading: "Booking Tips",
        content: "Book in advance for peak seasons (December, July-August). Check reviews from previous guests, confirm the exact location, and verify cancellation policies. Most hosts respond within a few hours and can arrange airport pickup or local recommendations.",
      },
    ],
  },
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

  const purpose = searchParams.purpose as keyof typeof CATEGORY_CONTENT
  const content = CATEGORY_CONTENT[purpose]

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-h1 text-text-primary sm:text-4xl">
            {content?.title || "Properties for Sale & Rent in Kenya"}
          </h1>
          <p className="mt-4 text-lg text-text-secondary leading-relaxed max-w-2xl">
            {content?.intro || "Browse houses, apartments, land and commercial properties for sale or rent across Kenya."}
          </p>
        </div>
        <div className="space-y-6">
          {content?.sections.map((section, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                {section.heading}
              </h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </section>
      <PropertiesPageClient searchParams={searchParams} />
    </>
  )
}
