"use client";

/* eslint-disable @next/next/no-img-element -- DB thumbs are served direct (unoptimized) from the API host */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  Building2,
  Bed,
  Bath,
  Maximize2,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  Star,
  ArrowRight,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Home,
  Key,
  Camera,
  Globe,
  Sparkles,
} from "@/components/ui/icons";
import { getGalleryImages, optimizeImageUrl } from "@/lib/images";
import { slugifyCity } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { FormBanner } from "@/components/shared/FormFeedback";
import type { ReviewItem } from "@/lib/services/review";
import { resolveImageUrl } from "@/lib/images";

interface SellerReviewsData {
  reviews: ReviewItem[];
  total: number;
  totalPages: number;
  avgRating: number | null;
  distribution: number[];
}

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
  userTypes?: string[] | null;
  primaryUserType?: string | null;
}

interface PropertyData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  propertyType: string;
  listingPurpose?: string | null;
  subType?: string | null;
  city: string;
  region?: string | null;
  country: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  latitude?: unknown;
  longitude?: unknown;
  features: string[];
  images: unknown;
  coverImage?: string | null;
  agent?: AgentInfo | null;
}

interface OtherProperty {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  region?: string | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  images: unknown;
  coverImage?: string | null;
  listingPurpose?: string | null;
}

function listerRole(agent: AgentInfo): string | null {
  const t = agent.primaryUserType ?? agent.userTypes?.[0] ?? null;
  if (t === "AGENT") return "Agent";
  if (t === "PROPERTY_OWNER") return "Property Owner";
  if (t === "FUNDI") return "Fundi";
  if (t === "SERVICE_PROVIDER") return "Service Provider";
  return null;
}

function purposeLabel(purpose?: string | null): string {
  if (purpose === "FOR_RENT_SHORT_TERM") return "Short-term / Airbnb";
  if (purpose === "FOR_RENT_LONG_TERM") return "Long-term rent";
  return "For Sale";
}

function prettySubType(subType?: string | null): string | null {
  if (!subType) return null;
  return subType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PropertyDetailClient({ slug, initial, sellerReviews }: { slug: string; initial?: PropertyData; sellerReviews?: SellerReviewsData }) {
  const [property, setProperty] = useState<PropertyData | null>(initial ?? null);
  const [otherProperties, setOtherProperties] = useState<OtherProperty[]>([]);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(false);

  // Book-viewing form state (drives the WhatsApp handoff to the agent)
  const [viewerName, setViewerName] = useState("");
  const [viewerPhone, setViewerPhone] = useState("");
  const [viewerDate, setViewerDate] = useState("");
  const [viewerTime, setViewerTime] = useState("10:00 AM - Morning");
  const [viewingStatus, setViewingStatus] = useState<"idle" | "error" | "success">("idle");

  useEffect(() => {
    if (!slug) return;
    // If SSR already gave us this exact property, don't re-fetch it —
    // the edge cache for /api/properties/:slug can be stale (old JSON
    // without userTypes) and the loading flash overwrites the fresh SSR
    // badge for a second then hides it.
    if (initial && initial.slug === slug) {
      setProperty(initial);
      setError(false);
      setLoading(false);
      if (initial.agent?.id) {
        fetch(`/api/properties?agentId=${initial.agent.id}&limit=6`)
          .then((r) => r.json())
          .then((res: { properties: OtherProperty[] }) => {
            setOtherProperties(res.properties?.filter((op) => op.id !== initial.id) || []);
          })
          .catch(() => {});
      } else {
        setOtherProperties([]);
      }
      return;
    }

    setLoading(true);
    setError(false);

    fetch(`/api/properties/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((raw: { property: PropertyData }) => {
        const p = raw.property || raw;
        setProperty(p);
        if (p.agent?.id) {
          fetch(`/api/properties?agentId=${p.agent.id}&limit=6`)
            .then((r) => r.json())
            .then((res: { properties: OtherProperty[] }) => {
              setOtherProperties(res.properties?.filter((op) => op.id !== p.id) || []);
            })
            .catch(() => {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, initial]);

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

  // Cover-first deduped gallery per CONTRACT
  const rawGallery = getGalleryImages(property as { coverImage?: string | null; images?: unknown });
  // rawGallery already is [cover, ...filtered]; use it as canonical source
  const imageUrls = rawGallery.map((u) => optimizeImageUrl(u, 1600));

  const otherFiltered = otherProperties.filter((op) => op.id !== property.id);

  const agentAvatarUrl = property.agent ? resolveImageUrl(property.agent.avatar) ?? undefined : undefined;
  const agentLogoUrl = property.agent ? resolveImageUrl(property.agent.businessLogo) ?? undefined : undefined;
  const role = property.agent ? listerRole(property.agent) : null;

  const agentName = property.agent
    ? property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`
    : null;
  const agentPersonName = property.agent ? `${property.agent.firstName} ${property.agent.lastName}` : null;
  const agentPhoneDigits = property.agent?.phone ? property.agent.phone.replace(/[^0-9]/g, "") : "";
  const priceLabel = property.price == null ? "Price on request" : formatPrice(property.price, property.listingPurpose ?? undefined);
  const locationLine = `${property.region ? `${property.region}, ` : ""}${property.city}, ${property.country}`;
  const propertyTitle = property.title;
  const subTypeLabel = prettySubType(property.subType);

  function scrollToViewing() {
    document.getElementById("book-viewing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleViewingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!viewerName.trim() || !viewerPhone.trim() || !viewerDate) {
      setViewingStatus("error");
      return;
    }
    setViewingStatus("success");
    if (agentPhoneDigits) {
      const msg = `Hi ${agentPersonName ?? "there"}, I'm ${viewerName.trim()} (${viewerPhone.trim()}). I'd like to book a viewing of "${propertyTitle}" on ${viewerDate} at ${viewerTime}.`;
      window.open(`https://wa.me/${agentPhoneDigits}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-2 sm:pt-4 lg:pb-12">
      {/* ─── Title & action bar (Stitch: badges, h1, location, price) ─── */}
      <div className="flex flex-col gap-4 py-4 sm:py-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2" aria-label="Listing badges">
            {property.listingPurpose && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-500" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "bg-primary-600" : "bg-primary-500"}`}>
                {purposeLabel(property.listingPurpose)}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold capitalize text-text-secondary">
              {property.propertyType.toLowerCase()}
            </span>
            {subTypeLabel && (
              <span className="inline-flex items-center rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
                {subTypeLabel}
              </span>
            )}
          </div>
          <h1 className="break-words font-heading text-2xl font-bold leading-tight text-text-primary [overflow-wrap:anywhere] sm:text-3xl">
            {property.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-text-secondary">
            <MapPin size={16} className="shrink-0 text-primary-500" aria-hidden />
            <span>{locationLine}</span>
          </p>
        </div>
        <div className="shrink-0 lg:pb-1 lg:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {property.listingPurpose === "FOR_SALE" || !property.listingPurpose ? "Guide Sale Price" : "Asking Price"}
          </p>
          <p className="mt-0.5 break-words font-heading text-2xl font-bold tabular-nums text-text-primary [overflow-wrap:anywhere] sm:text-3xl">
            {priceLabel}
          </p>
          <p className="mt-0.5 text-xs font-medium text-text-secondary">
            {property.currency} {property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "· per night" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "· per month" : "· negotiable"}
          </p>
        </div>
      </div>

      {/* ─── Gallery card with glass location chip ─── */}
      <section aria-label="Property photos" className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <PropertyGallery images={imageUrls} title={property.title} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-secondary/70 px-4 py-2.5 backdrop-blur">
          <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-text-secondary">
            <MapPin size={14} className="shrink-0 text-primary-500" aria-hidden />
            <span className="truncate">{locationLine}</span>
          </p>
          <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Camera size={14} aria-hidden />
            <span>{imageUrls.length} {imageUrls.length === 1 ? "photo" : "photos"}</span>
          </p>
        </div>
      </section>

      {/* ─── Core two-column discovery & contact layout ─── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ─── LEFT: specs, narrative, features, map, reviews ─── */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          {/* Key metrics strip */}
          {(property.bedrooms || property.bathrooms || property.area) && (
            <section aria-label="Key specifications" className="rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {property.bedrooms ? (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-secondary p-3 text-center">
                    <Bed size={20} className="mb-1 shrink-0 text-primary-500" aria-hidden />
                    <p className="font-heading text-base font-bold tabular-nums text-text-primary">{property.bedrooms}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Bedrooms</p>
                  </div>
                ) : null}
                {property.bathrooms ? (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-secondary p-3 text-center">
                    <Bath size={20} className="mb-1 shrink-0 text-primary-500" aria-hidden />
                    <p className="font-heading text-base font-bold tabular-nums text-text-primary">{property.bathrooms}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Bathrooms</p>
                  </div>
                ) : null}
                {property.area ? (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-secondary p-3 text-center">
                    <Maximize2 size={18} className="mb-1 shrink-0 text-primary-500" aria-hidden />
                    <p className="font-heading text-base font-bold tabular-nums text-text-primary">{Number(property.area).toLocaleString()}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Sqft</p>
                  </div>
                ) : null}
                <div className="flex flex-col items-center justify-center rounded-lg bg-surface-secondary p-3 text-center">
                  <Home size={20} className="mb-1 shrink-0 text-primary-500" aria-hidden />
                  <p className="max-w-full truncate font-heading text-base font-bold capitalize text-text-primary">{property.propertyType.toLowerCase()}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Type</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-surface-secondary p-3 text-center">
                  <Key size={20} className="mb-1 shrink-0 text-primary-500" aria-hidden />
                  <p className="max-w-full truncate font-heading text-base font-bold text-text-primary">
                    {property.listingPurpose === "FOR_RENT_SHORT_TERM" ? "Airbnb" : property.listingPurpose === "FOR_RENT_LONG_TERM" ? "Rent" : "Sale"}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Listing</p>
                </div>
              </div>
            </section>
          )}

          {/* Architectural overview */}
          {property.description && (
            <section aria-labelledby="overview-heading" className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <h2 id="overview-heading" className="font-heading text-lg font-bold text-text-primary">Architectural Overview</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {property.description}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-surface-secondary p-4 md:grid-cols-3">
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Location</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-text-primary">{property.city}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Region</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-text-primary">{property.region || "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Country</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-text-primary">{property.country}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Property Type</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold capitalize text-text-primary">{property.propertyType.toLowerCase()}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Listing Purpose</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-text-primary">{purposeLabel(property.listingPurpose)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Price</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-text-primary">{priceLabel}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Amenities & features */}
          {property.features.length > 0 && (
            <section aria-labelledby="amenities-heading" className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <h2 id="amenities-heading" className="font-heading text-lg font-bold text-text-primary">Estate Amenities &amp; Infrastructure</h2>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {property.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg bg-surface-secondary p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary-600">
                      <CheckCircle2 size={20} aria-hidden />
                    </span>
                    <span className="min-w-0 break-words text-sm font-medium text-text-primary">{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Neighborhood & map */}
          <section aria-labelledby="location-heading" className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <h2 id="location-heading" className="font-heading text-lg font-bold text-text-primary">Neighborhood &amp; Connectivity</h2>
            <p className="mt-1 text-sm text-text-secondary">Situated in {property.city}{property.region ? `, ${property.region}` : ""} — explore the surroundings</p>
            <div className="mt-4 isolate">
              <PropertyMap
                lat={property.latitude ? Number(property.latitude) : null}
                lng={property.longitude ? Number(property.longitude) : null}
                address={`${property.city}, ${property.region || ""}, ${property.country}`}
              />
            </div>
          </section>

          {/* Mobile agent card (Stitch mobile: listing-agent block) */}
          {property.agent && (
            <section aria-label="Listing agent" className="rounded-xl border border-border bg-surface p-4 shadow-sm lg:hidden">
              <div className="mb-3 flex items-center gap-3">
                {property.agent.avatar ? (
                  <Image
                    src={agentAvatarUrl as string} unoptimized
                    alt={`${property.agent.firstName} ${property.agent.lastName}`}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-primary-50">
                    <Building2 size={22} className="text-primary-500" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{agentName}</p>
                  <p className="truncate text-xs text-text-secondary">{role ?? property.agent.category ?? "Property contact"}</p>
                  {sellerReviews && sellerReviews.total > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-text-primary">
                      <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden />
                      {sellerReviews.avgRating != null ? sellerReviews.avgRating.toFixed(1) : "--"}
                      <span className="font-normal text-text-secondary">({sellerReviews.total} verified)</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {property.agent.phone && (
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="touch-target flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                  >
                    <Phone size={16} aria-hidden />
                    Call Agent
                  </a>
                )}
                {agentPhoneDigits && (
                  <a
                    href={`https://wa.me/${agentPhoneDigits}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                  >
                    <MessageCircle size={16} aria-hidden />
                    WhatsApp
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={scrollToViewing}
                className="touch-target mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-600"
              >
                <Calendar size={16} aria-hidden />
                Book Viewing
              </button>
            </section>
          )}

          {/* ─── Customer reviews of the seller (always shown) ─── */}
          {sellerReviews && property.agent && (
            <section id="reviews" aria-label="Customer reviews of the seller" className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600">
                    Customer feedback
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Star className="h-5 w-5 fill-accent-500 text-accent-500" aria-hidden />
                    <span className="font-heading text-xl font-bold tabular-nums text-text-primary">
                      {sellerReviews.avgRating != null ? sellerReviews.avgRating.toFixed(1) : "--"}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {sellerReviews.total > 0
                        ? `${sellerReviews.total} ${sellerReviews.total === 1 ? "review" : "reviews"} of the seller`
                        : "No customer reviews yet"}
                    </span>
                  </div>
                </div>
                {sellerReviews.total > 0 && (
                  <Link
                    href={`/profiles/${property.agent.id}`}
                    className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    View profile
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                )}
              </div>

              <ReviewSection
                targetId={property.agent.id}
                initialSummary={{
                  avgRating: sellerReviews.avgRating,
                  total: sellerReviews.total,
                  distribution: (sellerReviews.distribution as [number, number, number, number, number]) || [0, 0, 0, 0, 0],
                }}
                initialReviews={sellerReviews.reviews}
                initialTotalPages={sellerReviews.totalPages}
                emptyMessage={`Be the first customer to review ${property.agent.companyName || `${property.agent.firstName} ${property.agent.lastName}`}.`}
              />
            </section>
          )}
        </div>

        {/* ─── RIGHT: sticky agent contact card ─── */}
        <aside className="hidden min-w-0 lg:col-span-4 lg:block">
          {property.agent && (
            <div className="sticky top-20 space-y-5">
              <div className="rounded-xl border border-border bg-surface p-5 shadow-lg">
                {/* Verified agent header */}
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="relative shrink-0">
                    {property.agent.avatar ? (
                      <Image
                        src={agentAvatarUrl as string} unoptimized
                        alt={`${property.agent.firstName} ${property.agent.lastName}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-xl border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-primary-50">
                        <Building2 size={24} className="text-primary-500" aria-hidden />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success-600 text-white shadow" title="Verified professional">
                      <ShieldCheck size={12} aria-hidden />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-bold text-text-primary">{agentName}</p>
                    <p className="truncate text-xs font-semibold text-accent-600">{role ?? property.agent.category ?? "Accredited contact"}</p>
                    {property.agent.category && role && (
                      <p className="truncate text-xs text-text-secondary">{property.agent.category}</p>
                    )}
                  </div>
                </div>

                {property.agent.businessLogo && (
                  <div className="mt-3 flex justify-start">
                    <Image
                      src={agentLogoUrl as string} unoptimized
                      alt="Business logo"
                      width={110}
                      height={40}
                      className="h-10 w-auto max-w-[110px] rounded border border-border bg-surface-secondary object-contain"
                    />
                  </div>
                )}

                {sellerReviews && sellerReviews.total > 0 && (
                  <Link
                    href={`/profiles/${property.agent.id}`}
                    className="group/badge mt-3 block rounded-lg border border-border bg-surface-secondary/60 px-3 py-2.5 transition-all hover:border-accent-500 hover:bg-surface"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-accent-500 text-accent-500" aria-hidden />
                        <span className="font-heading text-sm font-bold tabular-nums text-text-primary">
                          {sellerReviews.avgRating != null ? sellerReviews.avgRating.toFixed(1) : "--"}
                        </span>
                      </span>
                      <span className="text-[11px] font-medium text-text-secondary">
                        {sellerReviews.total} {sellerReviews.total === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary-600 transition-colors group-hover/badge:text-primary-700">
                      Read customer reviews
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/badge:translate-x-0.5" aria-hidden />
                    </p>
                  </Link>
                )}

                {property.agent.specialties && property.agent.specialties.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {property.agent.specialties.map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] text-text-secondary">
                          <Sparkles size={10} aria-hidden />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct CTAs: Call ghost + green WhatsApp + amber Book Viewing */}
                <div className="mt-4 space-y-2.5">
                  {agentPhoneDigits && (
                    <a
                      href={`https://wa.me/${agentPhoneDigits}?text=${encodeURIComponent(`Hi, I'm interested in ${property.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-whatsapp-dark"
                    >
                      <MessageCircle size={16} aria-hidden />
                      Chat on WhatsApp
                    </a>
                  )}
                  {property.agent.phone && (
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="touch-target flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors [overflow-wrap:anywhere] hover:bg-surface-secondary"
                    >
                      <Phone size={16} className="shrink-0" aria-hidden />
                      Call Agent
                    </a>
                  )}
                  {property.agent.email && (
                    <a
                      href={`mailto:${property.agent.email}`}
                      className="touch-target flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors [overflow-wrap:anywhere] hover:bg-surface-secondary"
                    >
                      <Mail size={16} className="shrink-0" aria-hidden />
                      Email Agent
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={scrollToViewing}
                    className="touch-target flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-600"
                  >
                    <Calendar size={16} aria-hidden />
                    Book Viewing
                  </button>
                  {property.agent.website && (
                    <a
                      href={property.agent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
                    >
                      <Globe size={12} aria-hidden />
                      {property.agent.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                {/* Book-viewing form */}
                <div id="book-viewing" className="mt-4 scroll-mt-24 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-primary">Book Private Site Inspection</p>
                  <form onSubmit={handleViewingSubmit} className="mt-3 flex flex-col gap-2.5">
                    <div>
                      <label htmlFor="viewing-name" className="mb-1 block text-xs font-medium text-text-secondary">Your Full Name</label>
                      <input
                        id="viewing-name"
                        type="text"
                        autoComplete="name"
                        value={viewerName}
                        onChange={(e) => setViewerName(e.target.value)}
                        placeholder="e.g. Jane Wanjiku"
                        className="touch-target w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-[16px] text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="viewing-phone" className="mb-1 block text-xs font-medium text-text-secondary">Phone Number (M-Pesa / WhatsApp)</label>
                      <input
                        id="viewing-phone"
                        type="tel"
                        autoComplete="tel"
                        value={viewerPhone}
                        onChange={(e) => setViewerPhone(e.target.value)}
                        placeholder="+254 7..."
                        className="touch-target w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-[16px] text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="viewing-date" className="mb-1 block text-xs font-medium text-text-secondary">Tour Date</label>
                        <input
                          id="viewing-date"
                          type="date"
                          value={viewerDate}
                          onChange={(e) => setViewerDate(e.target.value)}
                          className="touch-target w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="viewing-time" className="mb-1 block text-xs font-medium text-text-secondary">Preferred Time</label>
                        <select
                          id="viewing-time"
                          value={viewerTime}
                          onChange={(e) => setViewerTime(e.target.value)}
                          className="touch-target w-full rounded-lg border border-border bg-surface-secondary px-3 py-3 text-[16px] text-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option>10:00 AM - Morning</option>
                          <option>02:00 PM - Afternoon</option>
                          <option>04:30 PM - Golden Hour</option>
                        </select>
                      </div>
                    </div>
                    {viewingStatus === "error" && (
                      <FormBanner variant="error">Please enter your name, phone number, and preferred date.</FormBanner>
                    )}
                    {viewingStatus === "success" && (
                      <FormBanner variant="success">Inspection request ready — we opened WhatsApp so you can send it directly to the agent.</FormBanner>
                    )}
                    <button
                      type="submit"
                      className="touch-target mt-1 w-full rounded-lg bg-accent-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-600"
                    >
                      Schedule Site Visit
                    </button>
                  </form>
                </div>

                {/* Trust shield */}
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-secondary p-3">
                  <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success-600" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-text-primary">All Property Link Verified Protocol</p>
                    <p className="mt-0.5 text-xs leading-snug text-text-secondary">
                      Direct engagement with the accredited contact. No intermediary broker markups.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Share this listing
                </p>
                <ShareButtons title={property.title} />
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ─── Similar-properties rail ─── */}
      {otherFiltered.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="similar-heading" className="font-heading text-lg font-bold text-text-primary sm:text-xl">
              Similar listings{agentName ? ` from ${agentName}` : " nearby"}
            </h2>
            {property.agent && (
              <Link
                href={`/${property.propertyType === "LAND" ? "land" : "properties"}/${slugifyCity(property.city)}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Browse {property.city}
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherFiltered.slice(0, 6).map((op) => (
              <PropertyCard
                key={op.id}
                slug={op.slug}
                title={op.title}
                price={op.price}
                currency={op.currency}
                propertyType={op.propertyType ?? "HOUSE"}
                listingPurpose={op.listingPurpose}
                city={op.city}
                region={op.region ?? op.city}
                bedrooms={op.bedrooms ?? null}
                bathrooms={op.bathrooms ?? null}
                area={op.area ?? null}
                images={op.images}
                coverImage={op.coverImage}
                isFeatured={false}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Mobile persistent action bar (Stitch mobile) ─── */}
      {property.agent?.phone && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Total Valuation</p>
              <p className="truncate font-heading text-base font-bold tabular-nums text-text-primary">{priceLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`tel:${property.agent.phone}`}
                aria-label="Call agent"
                className="touch-target flex h-12 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-text-primary"
              >
                <Phone size={18} aria-hidden />
              </a>
              <button
                type="button"
                onClick={scrollToViewing}
                className="touch-target flex h-12 items-center gap-2 rounded-lg bg-accent-500 px-5 text-sm font-bold text-white shadow-sm"
              >
                <Calendar size={18} aria-hidden />
                Book Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
