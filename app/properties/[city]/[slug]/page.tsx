import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyBySlug, getOtherPropertiesByAgent } from "@/lib/services/property";
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

  const otherProperties = property.agent?.id
    ? await getOtherPropertiesByAgent(property.agent.id, property.id)
    : [];

  const mapQuery = encodeURIComponent(`${property.city}, ${property.region || ""}, ${property.country}`);

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
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr_300px]">

          {/* LEFT SIDEBAR — Business Profile + Map */}
          <aside className="hidden lg:block space-y-4">
            {property.agent && (
              <>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3 mb-4">
                    {property.agent.avatar ? (
                      <Image
                        src={property.agent.avatar}
                        alt={`${property.agent.firstName} ${property.agent.lastName}`}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 border-2 border-border">
                        <Building2 size={22} className="text-primary-500" />
                      </div>
                    )}
                    {property.agent.businessLogo && (
                      <div className="relative shrink-0 h-12 w-auto min-w-[48px] max-w-[120px]">
                        <Image
                          src={property.agent.businessLogo}
                          alt="Business logo"
                          width={120}
                          height={48}
                          className="h-12 w-auto max-w-[120px] rounded-lg border border-border object-contain bg-surface-secondary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 mb-3">
                    <h3 className="font-heading text-sm font-semibold text-text-primary truncate">
                      {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                    </h3>
                    {property.agent.companyName && (
                      <p className="truncate text-xs text-text-secondary">
                        {property.agent.firstName} {property.agent.lastName}
                      </p>
                    )}
                  </div>

                  {property.agent.category && (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 mb-2">
                      {property.agent.category}
                    </span>
                  )}

                  {property.agent.specialties?.length > 0 && (
                    <div className="mb-2">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {property.agent.specialties.map((s: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-0.5 rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] text-text-secondary">
                            <Sparkles size={8} />
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
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700"
                    >
                      <Globe size={12} />
                      {property.agent.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                {/* Google Maps */}
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <iframe
                    title="Property location on Google Maps"
                    src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    width="250"
                    height="200"
                    className="w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <a
                    href={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 border-t border-border px-3 py-2 text-xs font-medium text-primary-600 hover:bg-surface-secondary"
                  >
                    View on Google Maps
                  </a>
                </div>
              </>
            )}
          </aside>

          {/* CENTER — Gallery + Details */}
          <div className="min-w-0">
            <PropertyGallery images={imageUrls} title={property.title} />

            <h1 className="font-heading text-2xl font-bold text-text-primary">
              {property.title}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {property.region}, {property.city}, {property.country}
            </p>
            <p className="mt-2 font-heading text-xl font-bold text-primary-600">
              {property.currency} {Number(property.price).toLocaleString()}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 border-y border-border py-3">
              {property.bedrooms && (
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{property.bedrooms}</p>
                  <p className="text-xs text-text-secondary">Beds</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{property.bathrooms}</p>
                  <p className="text-xs text-text-secondary">Baths</p>
                </div>
              )}
              {property.area && (
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{property.area}</p>
                  <p className="text-xs text-text-secondary">Sqft</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-text-primary">Description</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {property.description}
              </p>
            </div>

            {property.features.length > 0 && (
              <div className="mt-4">
                <h2 className="mb-2 text-sm font-semibold text-text-primary">Features</h2>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map((f: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile-only business profile */}
            {property.agent && (
              <div className="mt-6 rounded-xl border border-border bg-surface p-4 lg:hidden">
                <div className="flex items-center gap-3 mb-3">
                  {property.agent.avatar ? (
                    <Image
                      src={property.agent.avatar}
                      alt={`${property.agent.firstName} ${property.agent.lastName}`}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 border border-border">
                      <Building2 size={18} className="text-primary-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                    </p>
                    {property.agent.category && (
                      <span className="text-xs text-primary-600">{property.agent.category}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR — Contact + Share + Other listings */}
          <aside className="space-y-4">
            {property.agent && (
              <>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-4 font-heading text-base font-semibold text-text-primary">Contact</h3>
                  <div className="space-y-2.5">
                    {property.agent.phone && (
                      <>
                        <a
                          href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5c]"
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${property.agent.phone}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                        >
                          <Phone size={16} />
                          {property.agent.phone}
                        </a>
                      </>
                    )}
                    {property.agent.email && (
                      <a
                        href={`mailto:${property.agent.email}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                      >
                        <Mail size={16} />
                        {property.agent.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    Share this listing
                  </p>
                  <ShareButtons title={property.title} />
                </div>

                {otherProperties.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <h3 className="mb-3 font-heading text-base font-semibold text-text-primary">
                      Other listings by {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                    </h3>
                    <div className="space-y-3">
                      {otherProperties.map((op) => {
                        const opImages = Array.isArray(op.images) ? op.images : [];
                        const thumbUrl = opImages.find((u): u is string => typeof u === "string");
                        return (
                          <Link
                            key={op.id}
                            href={`/properties/${encodeURIComponent(op.city.toLowerCase())}/${op.slug}`}
                            className="flex gap-3 rounded-lg border border-border p-2 transition-colors hover:bg-surface-secondary"
                          >
                            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-surface-secondary">
                              {thumbUrl && (
                                <Image
                                  src={thumbUrl}
                                  alt={op.title}
                                  width={80}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text-primary truncate">{op.title}</p>
                              <p className="text-xs text-text-secondary">{op.city}</p>
                              <p className="text-xs font-bold text-primary-600">{op.currency} {Number(op.price).toLocaleString()}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
