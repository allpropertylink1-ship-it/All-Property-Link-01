"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { Building2, Bed, Bath, Maximize2, Phone, Mail, Globe, Sparkles, MessageCircle, Loader2 } from "@/components/ui/icons";

const PropertyMap = dynamic(() => import("@/components/shared/PropertyMap").then(m => ({ default: m.PropertyMap })), {
  ssr: false,
  loading: () => <div className="h-48 rounded-xl bg-surface-secondary animate-pulse" />,
});

interface AgentInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  businessLogo?: string | null;
  companyName?: string | null;
  category?: string | null;
  specialties?: string[];
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

interface PropertyData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  propertyType: string;
  listingPurpose?: string | null;
  city: string;
  region?: string | null;
  country: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  features: string[];
  images: unknown;
  agent?: AgentInfo | null;
}

interface OtherProperty {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  images: unknown;
  listingPurpose?: string | null;
}

export default function PropertyDetailClient({ slug }: { slug: string }) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [otherProperties, setOtherProperties] = useState<OtherProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

    fetch(`/api/properties/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: PropertyData) => {
        setProperty(data);
        if (data.agent?.id) {
          fetch(`/api/properties?agentId=${data.agent.id}&limit=6`)
            .then((r) => r.json())
            .then((res: { properties: OtherProperty[] }) => {
              setOtherProperties(res.properties?.filter((p) => p.id !== data.id) || []);
            })
            .catch(() => {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex justify-center">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-text-secondary">Property not found</p>
      </div>
    );
  }

  const rawImages = Array.isArray(property.images) ? property.images : [];
  const imageUrls = rawImages.filter((u): u is string => typeof u === "string");

  const otherFiltered = otherProperties.filter((op) => op.id !== property.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://allpropertylink.co.ke/properties/${encodeURIComponent(property.city.toLowerCase())}/${property.slug}`,
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[240px_1fr_280px] xl:grid-cols-[260px_1fr_300px]">

          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="hidden lg:block space-y-5">
            {property.agent && (
              <>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3.5 mb-4">
                    {property.agent.avatar ? (
                      <Image
                        src={property.agent.avatar}
                        alt={`${property.agent.firstName} ${property.agent.lastName}`}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 border border-border">
                        <Building2 size={20} className="text-primary-500" />
                      </div>
                    )}
                    {property.agent.businessLogo && (
                      <div className="relative shrink-0 h-10 w-auto max-w-[110px]">
                        <Image
                          src={property.agent.businessLogo}
                          alt="Business logo"
                          width={110}
                          height={40}
                          className="h-10 w-auto max-w-[110px] rounded border border-border object-contain bg-surface-secondary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5 mb-3">
                    <p className="font-heading text-sm font-semibold text-text-primary truncate">
                      {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                    </p>
                    {property.agent.companyName && (
                      <p className="text-xs text-text-secondary truncate">
                        {property.agent.firstName} {property.agent.lastName}
                      </p>
                    )}
                  </div>

                  {property.agent.category && (
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 mb-2.5">
                      {property.agent.category}
                    </span>
                  )}

                  {property.agent.specialties && property.agent.specialties.length > 0 && (
                    <div className="mb-2.5">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {property.agent.specialties.map((s: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] text-text-secondary">
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
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Globe size={12} />
                      {property.agent.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                <PropertyMap
                  lat={property.latitude ? Number(property.latitude) : null}
                  lng={property.longitude ? Number(property.longitude) : null}
                  address={`${property.city}, ${property.region || ""}, ${property.country}`}
                />
              </>
            )}
          </aside>

          {/* ─── CENTER ─── */}
          <div className="min-w-0 space-y-5">
            <PropertyGallery images={imageUrls} title={property.title} />

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                {property.title}
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary">
                {property.region && `${property.region}, `}{property.city}, {property.country}
              </p>
              <p className="mt-2.5 font-heading text-2xl sm:text-3xl font-bold text-primary-600">
                {property.currency} {Number(property.price).toLocaleString()}{property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "/night" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "/month" : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {property.listingPurpose && (
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-400" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "bg-primary-600" : "bg-primary-500"}`}>
                    {property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "Short-term / Airbnb" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "Long-term rent" : "For Sale"}
                  </span>
                )}
                <span className="inline-block rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-text-secondary capitalize">
                  {property.propertyType.toLowerCase()}
                </span>
              </div>
            </div>

            {(property.bedrooms || property.bathrooms || property.area) && (
              <div className="flex gap-5 sm:gap-8 border-y border-border py-3">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed size={18} className="shrink-0 text-text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{property.bedrooms}</p>
                      <p className="text-[11px] text-text-secondary leading-none">Beds</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath size={18} className="shrink-0 text-text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{property.bathrooms}</p>
                      <p className="text-[11px] text-text-secondary leading-none">Baths</p>
                    </div>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center gap-2">
                    <Maximize2 size={16} className="shrink-0 text-text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{property.area}</p>
                      <p className="text-[11px] text-text-secondary leading-none">Sqft</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {property.description && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-text-primary">Description</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {property.features.length > 0 && (
              <div>
                <h2 className="mb-2.5 text-sm font-semibold text-text-primary">Features</h2>
                <div className="flex flex-wrap gap-1.5">
                  {property.features.map((f: string, i: number) => (
                    <span key={i} className="rounded-md bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-secondary">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map (mobile only — desktop map is in left sidebar) */}
            <div className="lg:hidden">
              <PropertyMap
                lat={property.latitude ? Number(property.latitude) : null}
                lng={property.longitude ? Number(property.longitude) : null}
                address={`${property.city}, ${property.region || ""}, ${property.country}`}
              />
            </div>

            {/* Mobile: condensed business + contact */}
            {property.agent && (
              <div className="rounded-xl border border-border bg-surface p-4 lg:hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 border border-border">
                    <Building2 size={18} className="text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}
                    </p>
                    {property.agent.category && (
                      <span className="text-xs text-primary-600">{property.agent.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {property.agent.phone && (
                    <>
                      <a
                        href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary"
                      >
                        <Phone size={14} />
                        Call
                      </a>
                    </>
                  )}
                  {property.agent.email && (
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary"
                    >
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside className="hidden lg:block space-y-5">
            {property.agent && (
              <>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="mb-4 font-heading text-sm font-semibold text-text-primary">Contact</h3>
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
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                        >
                          <Phone size={16} />
                          {property.agent.phone}
                        </a>
                      </>
                    )}
                    {property.agent.email && (
                      <a
                        href={`mailto:${property.agent.email}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                      >
                        <Mail size={16} />
                        {property.agent.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                    Share this listing
                  </p>
                  <ShareButtons title={property.title} />
                </div>

                {otherFiltered.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <h3 className="mb-3.5 font-heading text-sm font-semibold text-text-primary">
                      More from {property.agent.companyName || `${property.agent.firstName}`}
                    </h3>
                    <div className="space-y-3">
                      {otherFiltered.map((op) => {
                        const opImages = Array.isArray(op.images) ? op.images : [];
                        const thumbUrl = opImages.find((u): u is string => typeof u === "string");
                        return (
                          <Link
                            key={op.id}
                            href={`/properties/${encodeURIComponent(op.city.toLowerCase())}/${op.slug}`}
                            className="group flex gap-3 rounded-lg border border-border p-2 transition-colors hover:bg-surface-secondary"
                          >
                            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
                              {thumbUrl && (
                                <Image
                                  src={thumbUrl}
                                  alt={op.title}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary-600 transition-colors">
                                {op.title}
                              </p>
                              <p className="text-xs text-text-secondary mt-0.5">{op.city}</p>
                              <p className="text-xs font-bold text-primary-600 mt-0.5">
                                {op.currency} {Number(op.price).toLocaleString()}{op.listingPurpose === "FOR_RENT_SHORT_TERM" ? "/night" : op.listingPurpose === "FOR_RENT_LONG_TERM" ? "/month" : ""}
                              </p>
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