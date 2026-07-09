import Image from "next/image";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/services/property";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { Building2, Phone, Mail, Globe, Sparkles, MessageCircle } from "lucide-react";

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
      <PropertyGallery images={imageUrls} title={property.title} />

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

          {/* Share - clearly visible near listing details */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              Share this listing
            </p>
            <ShareButtons title={property.title} />
          </div>
        </div>

        <div className="space-y-4">
          {property.agent && (
            <>
              {/* Business Profile */}
              <div className="rounded-xl border border-border bg-surface p-6">
                {/* Photo row: avatar + businessLogo side by side */}
                <div className="flex items-center gap-4 mb-5">
                  {property.agent.avatar ? (
                    <Image
                      src={property.agent.avatar}
                      alt={`${property.agent.firstName} ${property.agent.lastName}`}
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] shrink-0 rounded-full border-2 border-border object-cover"
                    />
                  ) : property.agent.businessLogo ? null : (
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-primary-50 border-2 border-border">
                      <Building2 size={28} className="text-primary-500" />
                    </div>
                  )}
                  {property.agent.businessLogo && (
                    <div className="relative shrink-0 h-[72px] w-auto min-w-[72px] max-w-[160px]">
                      <Image
                        src={property.agent.businessLogo}
                        alt="Business logo"
                        width={160}
                        height={72}
                        className="h-[72px] w-auto max-w-[160px] rounded-lg border border-border object-contain bg-surface-secondary"
                      />
                    </div>
                  )}
                </div>

                {/* Name row */}
                <div className="min-w-0 mb-3">
                  <h3 className="font-heading text-base font-semibold text-text-primary truncate">
                    {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                  </h3>
                  {property.agent.companyName && (
                    <p className="truncate text-xs text-text-secondary">
                      {property.agent.firstName} {property.agent.lastName}
                    </p>
                  )}
                </div>

                {property.agent.category && (
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                      {property.agent.category}
                    </span>
                  </div>
                )}

                {property.agent.specialties?.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary">Specialties</p>
                    <div className="flex flex-wrap gap-1.5">
                      {property.agent.specialties.map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-text-secondary">
                          <Sparkles size={10} />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {property.agent.website && (
                  <a
                    href={property.agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Globe size={14} />
                    {property.agent.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {/* Contact Actions */}
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Contact</h3>
                <div className="space-y-3">
                  {property.agent.phone && (
                    <>
                      <a
                        href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5c]"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="touch-target flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                      >
                        <Phone size={18} />
                        {property.agent.phone}
                      </a>
                    </>
                  )}
                  {property.agent.email && (
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="touch-target flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                    >
                      <Mail size={18} />
                      {property.agent.email}
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}