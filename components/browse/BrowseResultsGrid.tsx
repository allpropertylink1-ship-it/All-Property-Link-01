"use client";

import { PropertyCard } from "@/components/property/PropertyCard";
import { optimizeImageUrl } from "@/lib/images";
import { PLACEHOLDER_SERVICE } from "@/lib/placeholders";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface BrowseProperty {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  propertyType: string;
  listingPurpose?: string | null;
  city: string;
  region: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: unknown;
  isFeatured: boolean;
  createdAt: string;
}

interface BrowseService {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  pricePeriod: string;
  city: string | null;
  region: string | null;
  images: unknown;
  viewCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string | null;
    businessLogo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

interface BrowseResultsGridProps {
  activeTab: "properties" | "services";
  properties: BrowseProperty[];
  services: BrowseService[];
  total: number;
}

function ServiceCard({ item }: { item: BrowseService }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? optimizeImageUrl(String(images[0]), 600) : PLACEHOLDER_SERVICE;
  
  return (
    <Link href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <img
          src={imageUrl}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SERVICE }}
        />
        {item.category && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-primary-500 px-2.5 py-1 text-xs font-semibold text-white">
            {item.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 font-heading text-sm font-semibold text-text-primary">{item.title}</h3>
        <p className="mt-1 text-xs text-text-secondary">{item.city || item.region || "Kenya"}</p>
        {item.price != null && (
          <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price), item.pricePeriod)}</p>
        )}
        {item.user && (
          <p className="mt-1 text-xs text-text-secondary">{item.user.firstName} {item.user.lastName}</p>
        )}
      </div>
    </Link>
  );
}

export function BrowseResultsGrid({
  activeTab,
  properties,
  services,
  total,
}: BrowseResultsGridProps) {
  const itemType = activeTab === "properties" ? "property" : "service";
  const currentItems = activeTab === "properties" ? properties : services;

  if (currentItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-secondary p-10 text-center">
        <p className="text-sm text-text-secondary">
          No {itemType}s found for this filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-text-secondary">
        {total} {total === 1 ? itemType : `${itemType}s`} found
      </p>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {activeTab === "properties" ? (
          properties.map((item) => (
            <PropertyCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              price={item.price}
              currency={item.currency}
              propertyType={item.propertyType}
              listingPurpose={item.listingPurpose}
              city={item.city}
              region={item.region}
              bedrooms={item.bedrooms}
              bathrooms={item.bathrooms}
              area={item.area}
              images={item.images}
              isFeatured={item.isFeatured}
            />
          ))
        ) : (
          services.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))
        )}
      </div>
    </>
  );
}