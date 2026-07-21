import { prisma } from "@/lib/prisma";
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
    const properties = await prisma.property.findMany({
      where: { deletedAt: null },
      select: { slug: true, city: true, updatedAt: true },
    });
    const cityMap = new Map<string, Date>();
    const entries: MetadataRoute.Sitemap = properties.map((p) => {
      const city = encodeURIComponent(p.city.toLowerCase());
      cityMap.set(p.city, p.updatedAt);
      return {
        url: `${base}/properties/${city}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });
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
