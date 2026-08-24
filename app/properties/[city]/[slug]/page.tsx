import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";
import PropertyBreadcrumbs from "@/components/property/PropertyBreadcrumbs";
import { getPropertyBySlug } from "@/lib/services/property";
import { getUserReviews } from "@/lib/services/review";
import { siteUrl, slugifyCity } from "@/lib/seo";

interface Props {
  params: { city: string; slug: string };
}

function firstImage(images: unknown): string | null {
  const arr = Array.isArray(images) ? images : [];
  return arr.find((u): u is string => typeof u === "string") ?? null;
}

function excerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 158);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);
  if (!property) return {};

  const canonical = `${siteUrl()}/properties/${slugifyCity(property.city)}/${property.slug}`;
  const description = excerpt(property.description || "");
  const image = firstImage(property.images);

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

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const canonicalCity = slugifyCity(property.city);
  if (params.city.toLowerCase() !== canonicalCity || slugifyCity(params.city) !== canonicalCity) {
    redirect(`/properties/${canonicalCity}/${property.slug}`);
  }

  const canonical = `${siteUrl()}/properties/${canonicalCity}/${property.slug}`;
  const images = Array.isArray(property.images)
    ? property.images.filter((u): u is string => typeof u === "string")
    : [];

  // Seller review summary (ISR-cached) for sidebar badge + top-3 block
  const sellerReviews = property.agent?.id ? await getUserReviews(property.agent.id) : undefined;

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: canonical,
    image: images[0] || undefined,
    datePosted: property.createdAt instanceof Date ? property.createdAt.toISOString() : undefined,
    offers: {
      "@type": "Offer",
      price: property.price == null ? undefined : Number(property.price),
      priceCurrency: property.currency,
      availability: "https://schema.org/InStock",
    },
    ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathrooms: property.bathrooms } : {}),
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
      { "@type": "ListItem", position: 2, name: "Properties", item: `${siteUrl()}/properties` },
      { "@type": "ListItem", position: 3, name: property.city, item: `${siteUrl()}/properties/${canonicalCity}` },
      { "@type": "ListItem", position: 4, name: property.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PropertyBreadcrumbs city={property.city} title={property.title} />
      <PropertyDetailClient slug={params.slug} initial={property} sellerReviews={sellerReviews} />
    </>
  );
}