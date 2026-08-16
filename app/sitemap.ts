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
  { url: `${base}/agents`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

function isTestListing(title: string): boolean {
  return /\btest\b/i.test(title);
}

async function propertyPages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const first = await getProperties({ page: 1, pageSize: 50 });
    const pageCount = Math.max(1, first.totalPages || 1);
    const pages = [first];
    for (let p = 2; p <= pageCount; p++) {
      pages.push(await getProperties({ page: p, pageSize: 50 }));
    }

    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];
    const cityDates = new Map<string, Date>();

    for (const { properties } of pages) {
      for (const prop of properties) {
        if (isTestListing(prop.title)) continue;
        const city = slugifyCity(prop.city);
        const url = `${base}/properties/${city}/${prop.slug}`;
        if (seen.has(url)) continue;
        seen.add(url);
        cityDates.set(city, prop.createdAt);
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

    return [...cities, ...entries];
  } catch {
    return [];
  }
}

async function servicePages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const first = await getServiceListings({ page: "1", limit: "50" });
    const pageCount = Math.max(1, first.totalPages || 1);
    const pages = [first];
    for (let p = 2; p <= pageCount; p++) {
      pages.push(await getServiceListings({ page: String(p), limit: "50" }));
    }

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  return [...staticPages(base), ...(await propertyPages(base)), ...(await servicePages(base))];
}