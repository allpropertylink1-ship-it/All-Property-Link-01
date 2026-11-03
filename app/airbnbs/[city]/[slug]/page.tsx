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
  if (!property || property.listingPurpose !== "FOR_RENT_SHORT_TERM" || property.propertyType === "LAND") return {};

  const isArchived = property.status === "SOLD" || property.status === "RENTED";
  const canonicalCity = slugifyCity(property.city);
  const canonical = `${siteUrl()}/airbnbs/${canonicalCity}/${property.slug}`;
  const description = excerpt(property.description || "");
  const image = firstImage(property as { coverImage?: string | null; images?: unknown });

  return {
    title: property.title,
    description,
    alternates: { canonical },
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

export default async function AirbnbDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const canonicalCity = slugifyCity(property.city);

  // Only short-term rentals belong here; consolidate anything else on its canonical section.
  if (property.listingPurpose !== "FOR_RENT_SHORT_TERM" || property.propertyType === "LAND") {
    const base = property.propertyType === "LAND" ? "/land" : "/properties";
    permanentRedirect(`${base}/${canonicalCity}/${property.slug}`);
  }

  // City slug canonicalisation.
  if (params.city.toLowerCase() !== canonicalCity || slugifyCity(params.city) !== canonicalCity) {
    redirect(`/airbnbs/${canonicalCity}/${property.slug}`);
  }

  const canonical = `${siteUrl()}/airbnbs/${canonicalCity}/${property.slug}`;
  const coverForLd = getCoverImage(property as { coverImage?: string | null; images?: unknown });

  const isArchived = property.status === "SOLD" || property.status === "RENTED";
  const sellerReviews = property.agent?.id ? await getUserReviews(property.agent.id) : undefined;

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.title,
    description: property.description,
    url: canonical,
    image: coverForLd || undefined,
    datePosted: property.createdAt instanceof Date ? property.createdAt.toISOString() : undefined,
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
      { "@type": "ListItem", position: 2, name: "Airbnbs", item: `${siteUrl()}/airbnbs` },
      { "@type": "ListItem", position: 3, name: property.city, item: `${siteUrl()}/airbnbs/${canonicalCity}` },
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
            answer: "Short-term stay rates are often negotiable, especially for longer stays. Contact the host directly to discuss price and terms.",
          },
          {
            question: "What documents do I need to book?",
            answer: "Valid ID is typically required. For longer stays, hosts may ask for proof of income or references. Check the listing details or ask the host.",
          },
          {
            question: "Are there additional costs beyond the nightly rate?",
            answer: "Yes. Budget for cleaning fees, service charges, taxes, and a refundable security deposit where applicable. The total is shown before you confirm booking.",
          },
        ]}
        pageTitle={property.title + " — FAQ"}
        pageUrl={canonical}
      />
      <PropertyBreadcrumbs city={property.city} title={property.title} basePath="/airbnbs" baseLabel="Airbnbs" />
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
