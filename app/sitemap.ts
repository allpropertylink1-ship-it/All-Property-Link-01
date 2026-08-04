import { getProperties } from "@/lib/services/property";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

function baseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (url) return url.startsWith("http") ? url : `https://${url}`;
  return "https://allpropertylink.co.ke";
}

const staticPages = (base: string): MetadataRoute.Sitemap => [
  { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${base}/properties/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
];

async function propertyPages(base: string): Promise<MetadataRoute.Sitemap> {
  try {
    const first = await getProperties({ page: 1, pageSize: 50 });
    const pageCount = Math.max(1, first.totalPages || 1);
    const pages = [first];
    for (let p = 2; p <= pageCount; p++) {
      pages.push(await getProperties({ page: p, pageSize: 50 }));
    }

    const cityMap = new Map<string, Date>();
    const entries: MetadataRoute.Sitemap = [];
    for (const { properties } of pages) {
      for (const prop of properties) {
        const city = encodeURIComponent(prop.city.toLowerCase());
        cityMap.set(prop.city, prop.createdAt);
        entries.push({
          url: `${base}/properties/${city}/${prop.slug}`,
          lastModified: prop.createdAt,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
    const cities: MetadataRoute.Sitemap = Array.from(cityMap.entries()).map(([city]) => ({
      url: `${base}/properties/${encodeURIComponent(city.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...cities, ...entries];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  return [...staticPages(base), ...(await propertyPages(base))];
}
