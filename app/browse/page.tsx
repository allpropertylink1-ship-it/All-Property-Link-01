import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

function formatPrice(price: number, currency: string, listingPurpose?: string | null) {
  const formatted = `${currency} ${price.toLocaleString()}`;
  if (listingPurpose === "FOR_RENT_SHORT_TERM") return `${formatted}/night`;
  if (listingPurpose === "FOR_RENT_LONG_TERM") return `${formatted}/month`;
  return formatted;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

async function getCategories() {
  const [allProperties, airbnbs, services, plots] = await Promise.all([
    prisma.property.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.property.findMany({
      where: { deletedAt: null, listingPurpose: "FOR_RENT_SHORT_TERM" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        slug: true, title: true, price: true, currency: true,
        propertyType: true, listingPurpose: true, city: true, region: true,
        bedrooms: true, bathrooms: true, images: true,
      },
    }),
    prisma.serviceListing.findMany({
      where: { status: "ACTIVE", moderationStatus: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, title: true, price: true, currency: true,
        city: true, region: true, images: true,
        category: { select: { name: true, slug: true } },
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.property.findMany({
      where: { deletedAt: null, propertyType: "LAND" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        slug: true, title: true, price: true, currency: true,
        propertyType: true, city: true, region: true,
        bedrooms: true, bathrooms: true, images: true,
      },
    }),
  ]);

  return { allProperties, airbnbs, services, plots };
}

interface PropertyItem {
  slug: string; title: string; price: number | { toString(): string }; currency: string;
  propertyType: string; listingPurpose?: string | null; city: string; region: string;
  bedrooms: number | null; bathrooms: number | null; images: unknown;
}

function PropertyCard({ item, link }: { item: PropertyItem; link: string }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? String(images[0]) : "/placeholder.svg";
  return (
    <Link href={link} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <Image src={imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <span className={`absolute left-2 top-2 z-10 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${item.listingPurpose === "FOR_RENT_SHORT_TERM" ? "bg-accent-400" : "bg-primary-500"}`}>
          {item.listingPurpose === "FOR_RENT_SHORT_TERM" ? "Airbnb" : item.propertyType === "LAND" ? "Land" : item.propertyType === "COMMERCIAL" ? "Commercial" : item.propertyType === "APARTMENT" ? "Apartment" : "House"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
          <MapPin size={12} className="shrink-0" />
          {item.region}, {item.city}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
          {item.bedrooms != null && item.bedrooms > 0 && <span>{item.bedrooms} beds</span>}
          {item.bathrooms != null && item.bathrooms > 0 && <span>{item.bathrooms} baths</span>}
        </div>
        <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price), item.currency, item.listingPurpose)}</p>
      </div>
    </Link>
  );
}

interface ServiceItem {
  id: string; title: string; price: number | { toString(): string } | null; currency: string;
  city: string | null; region: string | null; images: unknown;
  category: { name: string; slug: string } | null;
  user: { firstName: string; lastName: string; avatar: string | null } | null;
}

function ServiceCard({ item }: { item: ServiceItem }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? String(images[0]) : "/placeholder.svg";
  return (
    <Link href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <Image src={imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        {item.category && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-accent-400 px-2.5 py-1 text-xs font-semibold text-white">
            {item.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
        <p className="mt-1 text-xs text-text-secondary">{item.city || item.region || "Kenya"}</p>
        {item.price != null && (
        <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price), item.currency)}</p>
        )}
        {item.user && (
          <p className="mt-1 text-xs text-text-secondary">{item.user.firstName} {item.user.lastName}</p>
        )}
      </div>
    </Link>
  );
}

export default async function BrowsePage() {
  const { allProperties, airbnbs, services, plots } = await getCategories();

  const properties = allProperties.filter((p) => p.listingPurpose !== "FOR_RENT_SHORT_TERM").slice(0, 6);
  const plotsFiltered = plots.length > 0 ? plots : allProperties.filter((p) => p.propertyType === "LAND").slice(0, 6);

  const sectionList: {
    id: string; title: string; icon: React.ComponentType<{ className?: string }>;
    items: unknown[]; viewAllLink: string; viewAllLabel: string; emptyMsg: string;
    renderItem: (item: unknown) => React.ReactNode;
  }[] = [
    {
      id: "properties", title: "Properties for Sale", icon: HomeIcon,
      items: properties, viewAllLink: "/properties?purpose=FOR_SALE",
      viewAllLabel: "View all properties", emptyMsg: "No properties for sale yet.",
      renderItem: (item: unknown) => {
        const i = item as PropertyItem;
        return <PropertyCard key={i.slug} item={i} link={`/properties/${i.city.toLowerCase()}/${i.slug}`} />;
      },
    },
    {
      id: "airbnbs", title: "Airbnbs & Short-term Stays", icon: BedIcon,
      items: airbnbs, viewAllLink: "/properties?purpose=FOR_RENT_SHORT_TERM",
      viewAllLabel: "View all stays", emptyMsg: "No short-term rentals listed yet.",
      renderItem: (item: unknown) => {
        const i = item as PropertyItem;
        return <PropertyCard key={i.slug} item={i} link={`/properties/${i.city.toLowerCase()}/${i.slug}`} />;
      },
    },
    {
      id: "services", title: "Fundis & Service Providers", icon: BriefcaseIcon,
      items: services, viewAllLink: "/services",
      viewAllLabel: "View all services", emptyMsg: "No services listed yet.",
      renderItem: (item: unknown) => {
        const i = item as ServiceItem;
        return <ServiceCard key={i.id} item={i} />;
      },
    },
    {
      id: "plots", title: "Plots & Land", icon: MapPin,
      items: plotsFiltered, viewAllLink: "/properties?type=LAND",
      viewAllLabel: "View all plots", emptyMsg: "No plots listed yet.",
      renderItem: (item: unknown) => {
        const i = item as PropertyItem;
        return <PropertyCard key={i.slug} item={i} link={`/properties/${i.city.toLowerCase()}/${i.slug}`} />;
      },
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary">Browse All Listings</h1>
        <p className="mt-2 text-text-secondary">Explore everything available on All Property Link</p>
      </div>

      <div className="space-y-12">
        {sectionList.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.id}>
              <div className="mb-5 flex items-end justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                    <Icon className="h-4 w-4 text-primary-500" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-text-primary">{section.title}</h2>
                </div>
                <Link
                  href={section.viewAllLink}
                  className="touch-target flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {section.viewAllLabel}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {section.items.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map(section.renderItem)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-10 text-center">
                  <p className="text-sm text-text-secondary">{section.emptyMsg}</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
