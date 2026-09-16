import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";
import PropertyBreadcrumbs from "@/components/property/PropertyBreadcrumbs";
import { getPropertyBySlug } from "@/lib/services/property";
import { getUserReviews } from "@/lib/services/review";
import { siteUrl, slugifyCity } from "@/lib/seo";
import { getCoverImage } from "@/lib/images";

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
  if (!property || property.propertyType !== "LAND") return {};

  const canonical = `${siteUrl()}/land/${slugifyCity(property.city)}/${property.slug}`;
  const description = excerpt(property.description || "");
  const image = firstImage(property as { coverImage?: string | null; images?: unknown });

  return {
    title: property.title,
    description,
    alternates: { canonical },
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

export default async function LandDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const canonicalCity = slugifyCity(property.city);
  // Non-land listings don't belong here — consolidate on the canonical URL.
  if (property.propertyType !== "LAND") {
    permanentRedirect(`/properties/${canonicalCity}/${property.slug}`);
  }
  if (params.city.toLowerCase() !== canonicalCity || slugifyCity(params.city) !== canonicalCity) {
    redirect(`/land/${canonicalCity}/${property.slug}`);
  }

  const canonical = `${siteUrl()}/land/${canonicalCity}/${property.slug}`;
  const coverForLd = getCoverImage(property as { coverImage?: string | null; images?: unknown });

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
      availability: "https://schema.org/InStock",
    },
    ...(property.area ? { floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "SQFT" } } : {}),
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
      { "@type": "ListItem", position: 2, name: "Land & Plots", item: `${siteUrl()}/land` },
      { "@type": "ListItem", position: 3, name: property.city, item: `${siteUrl()}/land/${canonicalCity}` },
      { "@type": "ListItem", position: 4, name: property.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PropertyBreadcrumbs city={property.city} title={property.title} basePath="/land" baseLabel="Land & Plots" />
      <PropertyDetailClient slug={params.slug} initial={property} sellerReviews={sellerReviews} />
    </>
  );
}
