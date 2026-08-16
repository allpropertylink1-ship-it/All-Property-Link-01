import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Phone, Mail, UserCheck, ArrowRight } from "@/components/ui/icons";
import { PropertyCard } from "@/components/property/PropertyCard";
import { getAgentById, getAgentListings } from "@/lib/services/agent";
import { siteUrl } from "@/lib/seo";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = await getAgentById(params.id);
  if (!agent) return {};

  const description = `${agent.fullName} is a verified APL Representative at All Property Link. Code: ${agent.agentCode}. Browse their recommended property listings across Kenya.`;

  return {
    title: `${agent.fullName} — APL Representative`,
    description,
    alternates: { canonical: `/agents/${agent.id}` },
    openGraph: {
      title: `${agent.fullName} — APL Representative`,
      description,
      type: "profile",
      siteName: "All Property Link",
    },
  };
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("+")) return digits.slice(1);
  return digits;
}

export default async function AgentDetailPage({ params }: Props) {
  const agent = await getAgentById(params.id);
  if (!agent) notFound();

  const listings = await getAgentListings(agent.id);
  const canonical = `${siteUrl()}/agents/${agent.id}`;

  const agentJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.fullName,
    url: canonical,
    telephone: agent.phone || undefined,
    email: agent.email || undefined,
    description: `${agent.fullName} is a verified APL Representative at All Property Link with ${agent._count.users} referrals and ${listings.length} property listings.`,
    areaServed: "Kenya",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl()}/` },
      { "@type": "ListItem", position: 2, name: "APL Representatives", item: `${siteUrl()}/agents` },
      { "@type": "ListItem", position: 3, name: agent.fullName, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agentJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="bg-primary-600 py-14 text-center text-text-on-primary sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
            {initials(agent.fullName)}
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{agent.fullName}</h1>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
            <UserCheck size={15} /> Verified APL Representative · {agent.agentCode}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">
                {agent.fullName}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} · {listings.length} listing{listings.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {agent.phone && (
                <>
                  <a
                    href={`tel:${agent.phone}`}
                    className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    <Phone size={15} /> {agent.phone}
                  </a>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    <ChatIcon /> WhatsApp
                  </a>
                </>
              )}
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <Mail size={15} /> Email
                </a>
              )}
            </div>
          </div>

          <Link
            href="/agents"
            className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowRight size={15} className="rotate-180" /> All representatives
          </Link>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-text-secondary">
              No listings from this representative&apos;s referrals yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((p) => (
                <PropertyCard
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  price={p.price}
                  currency={p.currency}
                  propertyType={p.propertyType}
                  listingPurpose={p.listingPurpose}
                  city={p.city}
                  region={p.region}
                  bedrooms={p.bedrooms}
                  bathrooms={p.bathrooms}
                  area={p.area}
                  images={p.images}
                  isFeatured={p.isFeatured}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.14 2 11.27c0 2.92 1.45 5.55 3.72 7.25L5 22.1l3.85-1.74c.99.27 2.05.41 3.15.41 5.52 0 10-4.14 10-9.5S17.52 2 12 2z" />
    </svg>
  );
}