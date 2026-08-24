import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import { getServiceById } from "@/lib/services/service";
import { getUserReviews } from "@/lib/services/review";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { Phone, Mail, Globe, Sparkles, MessageCircle, Star, MapPin, Briefcase } from "@/components/ui/icons";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceById(params.id);
  if (!service) return {};
  const description = (service.description || "").replace(/\s+/g, " ").trim().slice(0, 158);
  const image = Array.isArray(service.images)
    ? service.images.find((u): u is string => typeof u === "string")
    : undefined;
  return {
    title: service.title,
    description,
    alternates: { canonical: `/services/${service.id}` },
    openGraph: {
    title: `${service.title} — All Property Link`,
      description,
      type: "website",
      locale: "en_KE",
      siteName: "All Property Link",
      images: image ? [{ url: image, alt: service.title }] : undefined,
    },
  };
}

function formatServicePrice(price: number | null | undefined, currency: string, period: string) {
  if (price == null) return "Price on request";
  const formatted = `${currency} ${Number(price).toLocaleString()}`;
  if (period === "PER_MONTH") return `${formatted}/month`;
  if (period === "PER_NIGHT") return `${formatted}/night`;
  if (period === "PER_WEEK") return `${formatted}/week`;
  if (period === "PER_SQM") return `${formatted}/sqm`;
  return formatted;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}
        />
      ))}
    </span>
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getServiceById(params.id);
  if (!service) notFound();

  const rawImages = Array.isArray(service.images) ? service.images : [];
  const imageUrls = rawImages.filter((u: unknown): u is string => typeof u === "string");

  const providerId = service.user?.id ?? null;
  const reviewData = providerId ? await getUserReviews(providerId) : null;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: `${siteUrl()}/services/${service.id}`,
    ...(imageUrls[0] ? { image: imageUrls[0] } : {}),
    provider: {
      "@type": service.user?.companyName ? "Organization" : "Person",
      name: service.user?.companyName || `${service.user?.firstName || ""} ${service.user?.lastName || ""}`.trim(),
      ...(service.user?.phone ? { telephone: service.user.phone } : {}),
      ...(service.user?.email ? { email: service.user.email } : {}),
      ...(service.user?.website ? { url: service.user.website } : {}),
    },
    ...(service.city ? { areaServed: service.city } : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px] lg:gap-8 xl:grid-cols-[260px_1fr_300px]">
        {/* ─── LEFT SIDEBAR: Provider Profile ─── */}
        <aside className="hidden space-y-5 lg:block">
          {service.user && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center gap-3.5">
                {service.user.businessLogo ? (
                  <Image
                    src={service.user.businessLogo}
                    alt={service.user.companyName || "Business logo"}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-primary-50">
                    <Briefcase size={20} className="text-primary-500" />
                  </div>
                )}
              </div>

              <div className="mb-3 min-w-0 space-y-0.5">
                <p className="truncate font-heading text-sm font-semibold text-text-primary">
                  {service.user.companyName || `${service.user.firstName} ${service.user.lastName}`}
                </p>
                {service.user.companyName && (
                  <p className="truncate text-xs text-text-secondary">
                    {service.user.firstName} {service.user.lastName}
                  </p>
                )}
              </div>

              {service.category && (
                <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {service.category.name}
                </span>
              )}

              {service.user.specialties && service.user.specialties.length > 0 && (
                <div className="mb-2.5 mt-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                    Specialties
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {service.user.specialties.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] text-text-secondary"
                      >
                        <Sparkles size={10} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {service.user.website && (
                <a
                  href={service.user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  <Globe size={12} />
                  {service.user.website.replace(/^https?:\/\//, "")}
                </a>
              )}

              <div className="mt-3 border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={12} className="shrink-0" />
                  {service.city}
                  {service.region && `, ${service.region}`}
                </p>
              </div>
            </div>
          )}

        </aside>

        {/* ─── CENTER: Gallery + Details + Reviews ─── */}
        <div className="min-w-0 space-y-5">
          <PropertyGallery images={imageUrls} title={service.title} />

          <div>
            <div className="mb-2 flex items-center gap-2">
              {service.category && (
                <Link
                  href={`/services?category=${service.category.slug}`}
                  className="text-xs font-medium uppercase tracking-wider text-primary-600 hover:text-primary-700"
                >
                  {service.category.name}
                </Link>
              )}
            </div>
            <h1 className="font-heading text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
              {service.title}
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              {service.region && `${service.region}, `}
              {service.city || service.location}
            </p>
            <p className="mt-2.5 font-heading text-2xl font-bold text-primary-600 sm:text-3xl">
              {formatServicePrice(
                service.price != null ? Number(service.price) : null,
                service.currency,
                service.pricePeriod,
              )}
            </p>
            {service.avgRating && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={Math.round(service.avgRating)} />
                <span className="text-sm text-text-secondary">
                  {service.avgRating.toFixed(1)} ({service.reviewCount || 0}{" "}
                  {(service.reviewCount || 0) === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {service.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-text-primary">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {service.description}
              </p>
            </div>
          )}

          {/* Mobile: condensed provider + contact */}
          {service.user && (
            <div className="rounded-xl border border-border bg-surface p-4 lg:hidden">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-primary-50">
                  <Briefcase size={18} className="text-primary-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {service.user.companyName || `${service.user.firstName} ${service.user.lastName}`}
                  </p>
                  {service.category && (
                    <span className="text-xs text-primary-600">{service.category.name}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.user.phone && (
                  <>
                    <a
                      href={`https://wa.me/${service.user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${service.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${service.user.phone}`}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  </>
                )}
                {service.user.email && (
                  <a
                    href={`mailto:${service.user.email}`}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ─── Reviews Section (customer reviews of the provider) ─── */}
          {reviewData && providerId && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-text-primary">
                Reviews {reviewData.total > 0 && `(${reviewData.total})`}
              </h2>
              <ReviewSection
                targetId={providerId}
                initialSummary={{
                  avgRating: reviewData.avgRating,
                  total: reviewData.total,
                  distribution: [...reviewData.distribution] as [number, number, number, number, number],
                }}
                initialReviews={reviewData.reviews}
                initialTotalPages={reviewData.totalPages}
                emptyMessage="No customer reviews for this provider yet."
              />
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR: Contact + Share ─── */}
        <aside className="space-y-5">
          {service.user && (
            <>
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-4 font-heading text-sm font-semibold text-text-primary">Contact</h3>
                <div className="space-y-2.5">
                  {service.user.phone && (
                    <>
                      <a
                        href={`https://wa.me/${service.user.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${service.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5c]"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${service.user.phone}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                      >
                        <Phone size={16} />
                        {service.user.phone}
                      </a>
                    </>
                  )}
                  {service.user.email && (
                    <a
                      href={`mailto:${service.user.email}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                    >
                      <Mail size={16} />
                      {service.user.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Share this listing
                </p>
                <ShareButtons title={service.title} />
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
