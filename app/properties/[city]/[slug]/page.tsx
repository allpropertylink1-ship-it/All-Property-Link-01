import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";
import PropertyBreadcrumbs from "@/components/property/PropertyBreadcrumbs";
import { getPropertyBySlug } from "@/lib/services/property";
import { getUserReviews } from "@/lib/services/review";
import { siteUrl, slugifyCity } from "@/lib/seo";
import { getCoverImage } from "@/lib/images";
import { FAQSchema } from "@/components/faq/FAQSchema";

interface Props {
  params: { city: string; slug: string };
}

function firstImage(p: { coverImage?: string | null; images?: unknown }): string | null {
  return getCoverImage(p);
}

function excerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 158);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return {};

  const isArchived = property.status === "SOLD" || property.status === "RENTED";
  const canonical = `${siteUrl()}/properties/${slugifyCity(property.city)}/${property.slug}`;
  const mixSuffix = property.hasMultipleUnits && property.unitMixDescription
    ? ` Units: ${property.unitMixDescription}.`
    : "";
  const description = excerpt(`${property.description || ""}${mixSuffix}`);
  const image = firstImage(property as { coverImage?: string | null; images?: unknown });

  return {
    title: property.title,
    description,
    alternates: { canonical },
    // De-index unavailable listings so search engines stop surfacing sold/rented homes.
    ...(isArchived ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${property.title} — All Property Link`,
      description,
      type: "website",
      locale: "en_KE",
      siteName: "All Property Link",
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} — All Property Link`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const canonicalCity = slugifyCity(property.city);
  // Land has its own section — consolidate old /properties land URLs there.
  if (property.propertyType === "LAND") {
    permanentRedirect(`/land/${canonicalCity}/${property.slug}`);
  }
  if (params.city.toLowerCase() !== canonicalCity || slugifyCity(params.city) !== canonicalCity) {
    redirect(`/properties/${canonicalCity}/${property.slug}`);
  }

  const canonical = `${siteUrl()}/properties/${canonicalCity}/${property.slug}`;
  const coverForLd = getCoverImage(property as { coverImage?: string | null; images?: unknown });

  const isArchived = property.status === "SOLD" || property.status === "RENTED";

  // Seller review summary (ISR-cached) for sidebar badge + top-3 block
  const sellerReviews = property.agent?.id ? await getUserReviews(property.agent.id) : undefined;

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: canonical,
    image: coverForLd || undefined,
    datePosted: property.createdAt instanceof Date ? property.createdAt.toISOString() : undefined,
    offers: {
      "@type": "Offer",
      price: property.price == null ? undefined : Number(property.price),
      priceCurrency: property.currency,
      // Sold/rented listings are no longer available to purchase.
      availability: isArchived ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathrooms: property.bathrooms } : {}),
    ...(property.area ? { floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "SQFT" } } : {}),
    // Multi-unit buildings: one canonical URL, units as contained places —
    // Google sees every configuration, no per-unit URLs are emitted.
    ...((property.hasMultipleUnits && property.units && property.units.length > 0) ? {
      numberOfAvailableAccommodationUnits: property.units.length,
      containsPlace: property.units.map((u: {
        configuration: string; label?: string | null; bedrooms?: number | null;
        bathrooms?: number | null; area?: number | null; price?: number | string | null;
      }) => ({
        "@type": "Apartment",
        name: [u.configuration.replace(/_/g, " "), u.label].filter(Boolean).join(" — "),
        ...(u.bedrooms != null ? { numberOfBedrooms: u.bedrooms } : {}),
        ...(u.bathrooms != null ? { numberOfBathrooms: u.bathrooms } : {}),
        ...(u.area != null ? { floorSize: { "@type": "QuantitativeValue", value: u.area, unitCode: "MTK" } } : {}),
        ...(u.price != null ? {
          offers: {
            "@type": "Offer",
            price: Number(u.price),
            priceCurrency: property.currency,
            availability: isArchived ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          },
        } : {}),
      })),
    } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.region,
      addressCountry: property.country,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl()}/` },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${siteUrl()}/properties` },
      { "@type": "ListItem", position: 3, name: property.city, item: `${siteUrl()}/properties/${canonicalCity}` },
      { "@type": "ListItem", position: 4, name: property.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <FAQSchema
        faqs={[
          {
            question: "Can I schedule a viewing of this property?",
            answer: "Yes. Click 'Contact Agent' on the listing to request a viewing. Many agents offer virtual tours via video call or in-person viewings. Available viewing slots are shown on the listing when provided by the agent.",
          },
          {
            question: "Is the price negotiable?",
            answer: "Property prices are often negotiable. Contact the listing agent directly to discuss price and terms. The agent's contact details are shown on the listing page.",
          },
          {
            question: "What documents do I need to buy or rent this property?",
            answer: "For buying: valid ID, KRA PIN, and proof of funds. For renting: valid ID, proof of income, and references. Agents can guide you through the specific requirements for each property.",
          },
          {
            question: "Are there additional costs beyond the listed price?",
            answer: "Yes. Buyers should budget for stamp duty (4% urban / 2% rural), legal fees (~1-2%), and valuation fees. Renters should budget for a deposit (typically 1-2 months' rent) and possibly agency fees.",
          },
        ]}
        pageTitle={property.title + " — FAQ"}
        pageUrl={canonical}
      />
      <PropertyBreadcrumbs city={property.city} title={property.title} />
      {property.description && (
        <section aria-labelledby="property-description-heading" className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:py-12 lg:px-8">
          <h3 id="property-description-heading" className="font-display text-2xl font-bold tracking-h2 text-text-primary mb-4">
            Description
          </h3>
          <p className="text-text-secondary leading-relaxed text-lg">{property.description}</p>
        </section>
      )}
      <PropertyDetailClient slug={params.slug} initial={property} sellerReviews={sellerReviews} isArchived={isArchived} />
    </>
  );
}