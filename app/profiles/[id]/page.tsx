import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { Star, ArrowRight } from "@/components/ui/icons"
import { ProfileListingsGrid } from "../ProfileListingsGrid"
import { getProfile, getUserReviews } from "@/lib/services/review"
import { getProperties } from "@/lib/services/property"
import { siteUrl, slugifyCity } from "@/lib/seo"
import { formatReviewerName } from "@/lib/utils"

interface Props {
  params: { id: string }
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

function extractUuid(raw: string): string | null {
  const m = raw.match(UUID_RE)
  return m ? m[0] : null
}

function displayNameOf(p: { companyName: string | null; firstName: string; lastName: string }): string {
  return p.companyName?.trim() || `${p.firstName} ${p.lastName}`.trim()
}

const TYPE_LABEL: Record<string, string> = {
  FUNDI: "Fundi",
  SERVICE_PROVIDER: "Service Provider",
  AGENT: "Agent",
  PROPERTY_OWNER: "Property Owner",
  CUSTOMER: "Customer",
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const uuid = extractUuid(params.id)
  if (!uuid) return {}
  const profile = await getProfile(uuid)
  if (!profile) return {}

  const name = displayNameOf(profile)
  const description = `${name} on All Property Link — view their listings and customer reviews across Kenya.`

  return {
    title: `${name} — Reviews & Listings`,
    description,
    alternates: { canonical: `/profiles/${params.id}` },
    openGraph: {
      title: `${name} — Reviews & Listings`,
      description,
      type: "profile",
      siteName: "All Property Link",
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const uuid = extractUuid(params.id)
  if (!uuid) notFound()

  const profile = await getProfile(uuid)
  if (!profile) notFound()

  // Canonical URL is /profiles/{name-slug}-{uuid}; redirect bare/other variants.
  const canonicalId = `${slugifyCity(displayNameOf(profile))}-${uuid}`
  if (params.id !== canonicalId) {
    redirect(`/profiles/${canonicalId}`)
  }

  const [reviews, listingData] = await Promise.all([
    getUserReviews(uuid),
    getProperties({ agentId: uuid, pageSize: 24 }),
  ])

  const canonical = `${siteUrl()}/profiles/${canonicalId}`
  const name = displayNameOf(profile)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: canonical,
    description: `${name} on All Property Link — ${profile.listingCount} listing${profile.listingCount !== 1 ? "s" : ""}, ${profile.serviceCount} service${profile.serviceCount !== 1 ? "s" : ""}.`,
    address: profile.city ? { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "KE" } : undefined,
  }
  if (reviews.avgRating != null && reviews.total > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.avgRating,
      reviewCount: reviews.total,
      bestRating: 5,
      worstRating: 1,
    }
    jsonLd.review = reviews.reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: formatReviewerName(r.user.firstName, r.user.lastName) },
      datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
      reviewBody: r.comment || undefined,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    }))
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl()}/` },
      { "@type": "ListItem", position: 2, name, item: canonical },
    ],
  }

  const avatarUrl = profile.businessLogo || profile.avatar

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Identity band */}
      <section className="bg-primary-600 py-12 text-text-on-primary sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white/15">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-bold tracking-tight">{name}</h1>
              <p className="mt-1 text-sm text-white/85">
                {[
                  profile.primaryUserType ? TYPE_LABEL[profile.primaryUserType] : null,
                  profile.category,
                  profile.city,
                ]
                  .filter(Boolean)
                  .join(" · ") || "All Property Link member"}
              </p>
              {profile.specialties && profile.specialties.length > 0 && (
                <p className="mt-1 text-sm text-white/70">{profile.specialties.join(", ")}</p>
              )}
            </div>
            <dl className="flex shrink-0 gap-6 text-center">
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/70">Listings</dt>
                <dd className="font-heading text-xl font-bold">{listingData.total}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/70">Reviews</dt>
                <dd className="font-heading text-xl font-bold">{reviews.total}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/70">Avg</dt>
                <dd className="inline-flex items-center gap-1 font-heading text-xl font-bold">
                  <Star className="h-4 w-4 fill-accent-300 text-accent-300" />
                  {reviews.avgRating != null ? reviews.avgRating.toFixed(1) : "--"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Reviews + Listings */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-14 px-4">
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">Reviews</h2>
            <ReviewSectionMount
              targetId={uuid}
              summary={{ avgRating: reviews.avgRating, total: reviews.total, distribution: reviews.distribution }}
              reviews={reviews.reviews}
              totalPages={reviews.totalPages}
            />
          </div>

          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">
              Listings by {profile.firstName}
            </h2>
            {listingData.properties.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-secondary">
                No active listings right now.
              </div>
            ) : (
              <ProfileListingsGrid listings={listingData.properties} />
            )}
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowRight size={15} className="rotate-180" /> Browse all properties
          </Link>
        </div>
      </section>
    </div>
  )
}

// ReviewSection is a client component (uses useAuth); server page passes serializable data only.
import { ReviewSection } from "@/components/reviews/ReviewSection"

function ReviewSectionMount(props: {
  targetId: string
  summary: { avgRating: number | null; total: number; distribution: number[] }
  reviews: Parameters<typeof ReviewSection>[0]["initialReviews"]
  totalPages: number
}) {
  return (
    <ReviewSection
      targetId={props.targetId}
      initialSummary={props.summary}
      initialReviews={props.reviews}
      initialTotalPages={props.totalPages}
      emptyMessage="No customer reviews yet."
    />
  )
}
