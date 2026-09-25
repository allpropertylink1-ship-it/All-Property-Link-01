import { getProperties } from "@/lib/services/property";
import { getServiceListings } from "@/lib/services/service";
import { siteUrl, slugifyCity } from "@/lib/seo";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

const staticPages = (base: string): MetadataRoute.Sitemap => [
  { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  { url: `${base}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/airbnbs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/land`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/fundis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/aplreps`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

function isTestListing(title: string): boolean {
  return /\btest\b/i.test(title);
}

async function propertyPages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const first = await getProperties({ page: 1, pageSize: 50 });
    const pageCount = Math.max(1, first.totalPages || 1);
    const rest = pageCount > 1
      ? await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, i) => getProperties({ page: i + 2, pageSize: 50 }))
        )
      : [];
    const pages = [first, ...rest];

    // Land is excluded from default queries — harvest it explicitly.
    const landFirst = await getProperties({ page: 1, pageSize: 50, propertyType: "LAND" });
    const landPageCount = Math.max(1, landFirst.totalPages || 1);
    const landRest = landPageCount > 1
      ? await Promise.all(
          Array.from({ length: landPageCount - 1 }, (_, i) => getProperties({ page: i + 2, pageSize: 50, propertyType: "LAND" }))
        )
      : [];
    const allPages = [...pages, landFirst, ...landRest];

    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];
    const cityDates = new Map<string, Date>();
    const landCityDates = new Map<string, Date>();

    for (const { properties } of allPages) {
      for (const prop of properties) {
        if (isTestListing(prop.title)) continue;
        const city = slugifyCity(prop.city);
        // Land has its own section — keep /properties/* land-free.
        const isLand = (prop.propertyType || "").toUpperCase() === "LAND";
        const url = isLand
          ? `${base}/land/${city}/${prop.slug}`
          : `${base}/properties/${city}/${prop.slug}`;
        if (seen.has(url)) continue;
        seen.add(url);
        if (!isLand) cityDates.set(city, prop.createdAt);
        else landCityDates.set(city, prop.createdAt);
        entries.push({
          url,
          lastModified: prop.createdAt,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }

    const cities: MetadataRoute.Sitemap = Array.from(cityDates.entries()).map(([city, lastModified]) => ({
      url: `${base}/properties/${city}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const landCities: MetadataRoute.Sitemap = Array.from(landCityDates.entries()).map(([city, lastModified]) => ({
      url: `${base}/land/${city}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...cities, ...landCities, ...entries];
  } catch {
    return [];
  }
}

async function servicePages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const first = await getServiceListings({ page: "1", limit: "50" });
    const pageCount = Math.max(1, first.totalPages || 1);
    const rest = pageCount > 1
      ? await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, i) =>
            getServiceListings({ page: String(i + 2), limit: "50" })
          )
        )
      : [];
    const pages = [first, ...rest];

    const entries: MetadataRoute.Sitemap = [];
    const seen = new Set<string>();
    for (const { services } of pages) {
      for (const service of services) {
        if (isTestListing(service.title)) continue;
        const url = `${base}/services/${service.id}`;
        if (seen.has(url)) continue;
        seen.add(url);
        entries.push({
          url,
          lastModified: service.createdAt ? new Date(service.createdAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
    return entries;
  } catch {
    return [];
  }
}

async function agentPages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"}/api/apl-agents`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: { agents: { id: string; _count: { users: number } }[] } = await res.json();
    return (data.agents || []).map((agent) => ({
      url: `${base}/aplreps/${agent.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    }));
  } catch {
    return [];
  }
}

interface ProfileIndexEntry {
  id: string;
  firstName: string;
  lastName: string;
}

/** Seller profile pages (/profiles/{name-slug}-{uuid}) for sitemap. */
function profileUrl(id: string, firstName: string, lastName: string, base: string): string {
  const name = (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "member").trim();
  const slug = slugifyCity(name) || "member";
  return `${base}/profiles/${slug}-${id}`;
}

async function profilePages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"}/api/profiles`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: { profiles: ProfileIndexEntry[] } = await res.json();
    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];
    for (const p of data.profiles || []) {
      const url = profileUrl(p.id, p.firstName, p.lastName, base);
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  return [
    ...staticPages(base),
    ...(await propertyPages(base)),
    ...(await servicePages(base)),
    ...(await agentPages(base)),
    ...(await profilePages(base)),
  ];
}