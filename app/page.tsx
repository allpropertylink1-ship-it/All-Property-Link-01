import type { Metadata } from "next"
import { HomePageClient } from "./HomePageClient"
import { getProperties } from "@/lib/services/property"
import { getServiceListings, type ServiceListingCard } from "@/lib/services/service"
import type { ProfileRow } from "@/components/home/ProfileCard"
import { FAQSchema } from "@/components/faq/FAQSchema"
import { siteUrl } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  keywords: [
    "All Property Link",
    "property marketplace Kenya",
    "buy sell rent property",
    "real estate Kenya",
    "land plots for sale",
    "short term stays",
    "airbnb Kenya",
    "fundis",
    "service providers",
    "verified listings",
    "APL representatives",
  ],
  openGraph: {
    type: "website",
    images: [
      {
        url: `${siteUrl()}/logos/logo.png`,
        width: 1200,
        height: 630,
        alt: "All Property Link — Kenya property marketplace",
      },
    ],
  },
}

function toProfileRows(services: ServiceListingCard[]): ProfileRow[] {
  return services
    .filter((s) => !!s.user)
    .map((s) => ({ ...s, user: { ...s.user!, id: s.userId } }))
}

export default async function HomePage() {
  const [latest, airbnbs, land, featured, fundis, providers] = await Promise.all([
    getProperties({ pageSize: 24 }),
    getProperties({ purpose: "FOR_RENT_SHORT_TERM", pageSize: 8 }),
    getProperties({ propertyType: "LAND", pageSize: 8 }),
    getProperties({ featured: true, pageSize: 6 }),
    getServiceListings({ type: "FUNDI", limit: "6" }),
    getServiceListings({ type: "SERVICE_PROVIDER", limit: "6" }),
  ])

  const fundiRows = toProfileRows(fundis.services);
  const fundiIds = new Set(fundiRows.map((s) => s.id));
  const providerRows = toProfileRows(providers.services).filter((s) => !fundiIds.has(s.id));

  return (
    <>
      <HomePageClient
        featured={featured.properties}
        latest={latest.properties}
        airbnbs={airbnbs.properties}
        land={land.properties}
        fundis={fundiRows}
        providers={providerRows}
        fundiCount={fundis.total}
        providerCount={providers.total}
        propertyCount={latest.total}
      />
      <FAQSchema
        faqs={[
          {
            question: "How do I search for properties in a specific area?",
            answer: "Use the search bar on the homepage or properties page. Filter by location, property type, price range, bedrooms, and purpose. Land and plots have their own dedicated section at /land.",
          },
          {
            question: "Do I need an account to browse properties?",
            answer: "No, you can browse all property listings without an account. However, creating an account lets you save searches, get alerts for new listings, save favorites, and manage your own listings from your dashboard.",
          },
          {
            question: "How do I list my property for sale or rent?",
            answer: "Create an account, go to your dashboard, and click 'Add Listing'. Fill in property details, upload photos, set the price, and publish.",
          },
          {
            question: "What types of properties are available?",
            answer: "We list houses, apartments, land/plots, commercial properties, and short-term rentals. Each listing includes photos, price, location, features, and agent contact details.",
          },
          {
            question: "How do I contact a property agent?",
            answer: "Click 'Contact Agent' on any listing to contact them directly. You can also use the WhatsApp button for instant messaging.",
          },
          {
            question: "Is All Property Link free to use?",
            answer: "Browsing and searching is free. Property owners and agents pay for featured placement and premium listing options.",
          },
        ]}
        pageTitle="All Property Link FAQ"
        pageUrl="https://www.allpropertylink.co.ke"
      />
    </>
  )
}
