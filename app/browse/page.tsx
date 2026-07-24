import React, { cache } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Home, BedDouble, Briefcase } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke";

interface BrowseProperty {
  slug: string; title: string; price: number; currency: string;
  propertyType: string; listingPurpose?: string; city: string; region: string;
  bedrooms: number | null; bathrooms: number | null; images: unknown;
}

interface BrowseService {
  id: string; title: string; price: number | null; currency: string;
  city: string | null; region: string | null; images: unknown;
  category: { name: string; slug: string } | null;
  user: { firstName: string; lastName: string; avatar: string | null } | null;
}

const fetchApi = cache(async <T,>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null }
});

const getCategories = cache(async () => {
  const [allData, airbnbData, serviceData, plotData] = await Promise.all([
    fetchApi<{ properties: BrowseProperty[] }>("/api/properties?limit=20"),
    fetchApi<{ properties: BrowseProperty[] }>("/api/properties?purpose=FOR_RENT_SHORT_TERM&limit=6"),
    fetchApi<{ services: BrowseService[] }>("/api/services?limit=6"),
    fetchApi<{ properties: BrowseProperty[] }>("/api/properties?type=LAND&limit=6"),
  ]);

  return {
    allProperties: allData?.properties || [],
    airbnbs: airbnbData?.properties || [],
    services: serviceData?.services || [],
    plots: plotData?.properties || [],
  };
})

type PropertyItem = BrowseProperty;

function PropertyCard({ item, link }: { item: BrowseProperty; link: string }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? String(images[0]) : "/placeholder.svg";
  return (
    <Link href={link} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <img src={imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
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
        <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price), item.listingPurpose)}</p>
      </div>
    </Link>
  );
}

type ServiceItem = BrowseService;

function ServiceCard({ item }: { item: BrowseService }) {
  const images = Array.isArray(item.images) ? item.images : [];
  const imageUrl = images.length > 0 ? String(images[0]) : "/placeholder.svg";
  return (
    <Link href={`/services/${item.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
        <img src={imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
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
        <p className="mt-1.5 font-heading text-base font-bold text-primary-500">{formatPrice(Number(item.price))}</p>
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
    items: (PropertyItem | ServiceItem)[];
    viewAllLink: string; viewAllLabel: string; emptyMsg: string;
    renderItem: (item: PropertyItem | ServiceItem) => React.ReactNode;
  }[] = [
    {
      id: "properties", title: "Properties for Sale", icon: Home,
      items: properties, viewAllLink: "/properties?purpose=FOR_SALE",
      viewAllLabel: "View all properties", emptyMsg: "No properties for sale yet.",
      renderItem: (item) => <PropertyCard key={(item as PropertyItem).slug} item={item as PropertyItem} link={`/properties/${(item as PropertyItem).city.toLowerCase()}/${(item as PropertyItem).slug}`} />,
    },
    {
      id: "airbnbs", title: "Airbnbs & Short-term Stays", icon: BedDouble,
      items: airbnbs, viewAllLink: "/properties?purpose=FOR_RENT_SHORT_TERM",
      viewAllLabel: "View all stays", emptyMsg: "No short-term rentals listed yet.",
      renderItem: (item) => <PropertyCard key={(item as PropertyItem).slug} item={item as PropertyItem} link={`/properties/${(item as PropertyItem).city.toLowerCase()}/${(item as PropertyItem).slug}`} />,
    },
    {
      id: "services", title: "Fundis & Service Providers", icon: Briefcase,
      items: services, viewAllLink: "/services",
      viewAllLabel: "View all services", emptyMsg: "No services listed yet.",
      renderItem: (item) => <ServiceCard key={(item as ServiceItem).id} item={item as ServiceItem} />,
    },
    {
      id: "plots", title: "Plots & Land", icon: MapPin,
      items: plotsFiltered, viewAllLink: "/properties?type=LAND",
      viewAllLabel: "View all plots", emptyMsg: "No plots listed yet.",
      renderItem: (item) => <PropertyCard key={(item as PropertyItem).slug} item={item as PropertyItem} link={`/properties/${(item as PropertyItem).city.toLowerCase()}/${(item as PropertyItem).slug}`} />,
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
                  <ArrowRight className="h-4 w-4" />
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
