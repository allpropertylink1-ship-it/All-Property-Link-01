import Image from "next/image";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/services/property";
import { WhatsAppShare, WhatsAppContact } from "@/components/shared/WhatsAppShare";

interface Props {
  params: { slug: string };
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getPropertyBySlug(params.slug);
  if (!property) notFound();

  const rawImages = Array.isArray(property.images) ? property.images : [];
  const imageUrls = rawImages.filter((u): u is string => typeof u === "string");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://allpropertylink.vercel.app/properties/${encodeURIComponent(property.city.toLowerCase())}/${property.slug}`,
    image: imageUrls[0],
    offers: {
      "@type": "Offer",
      price: Number(property.price),
      priceCurrency: property.currency,
      availability: "https://schema.org/InStock",
    },
    ...(property.bedrooms && { numberOfBedrooms: property.bedrooms }),
    ...(property.bathrooms && { numberOfBathrooms: property.bathrooms }),
    ...(property.area && { floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "SQFT" } }),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.region,
      addressCountry: property.country,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {imageUrls.slice(0, 4).map((url, i) => (
          <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-secondary">
            <Image
              src={url}
              alt={property.title}
              width={400}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-text-primary">
                {property.title}
              </h1>
              <p className="mt-2 text-lg text-text-secondary">
                {property.region}, {property.city}, {property.country}
              </p>
              <p className="mt-4 font-heading text-2xl font-bold text-primary-600">
                {property.currency} {Number(property.price).toLocaleString()}
              </p>
            </div>
            <WhatsAppShare title={property.title} />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-y border-border py-4">
            {property.bedrooms && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.bedrooms}</p>
                <p className="text-xs text-text-secondary">Beds</p>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.bathrooms}</p>
                <p className="text-xs text-text-secondary">Baths</p>
              </div>
            )}
            {property.area && (
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">{property.area}</p>
                <p className="text-xs text-text-secondary">Sqft</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
              Description
            </h2>
            <p className="whitespace-pre-line text-text-secondary leading-relaxed">
              {property.description}
            </p>
          </div>

          {property.features.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
                Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-surface-secondary px-3 py-1 text-sm text-text-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              Lister
            </h3>
            {property.agent && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium text-text-primary">
                  {property.agent.firstName} {property.agent.lastName}
                </p>
                {property.agent.companyName && (
                  <p className="text-xs text-text-secondary">{property.agent.companyName}</p>
                )}
                {property.agent.category && (
                  <p className="text-xs text-text-secondary">{property.agent.category}</p>
                )}
                {property.agent.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {property.agent.specialties.map((s: string, i: number) => (
                      <span key={i} className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {property.agent?.phone && (
              <div className="mt-3">
                <WhatsAppContact phone={property.agent.phone} title={property.title} />
              </div>
            )}
            {property.agent?.email && (
              <a
                href={`mailto:${property.agent.email}`}
                className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {property.agent.email}
              </a>
            )}
            {property.agent?.website && (
              <a
                href={property.agent.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {property.agent.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}