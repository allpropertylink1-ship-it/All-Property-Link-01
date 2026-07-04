import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://allpropertylink.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/properties/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const properties = await prisma.property.findMany({
    where: { moderationStatus: "APPROVED", isPublished: true, deletedAt: null },
    select: { slug: true, city: true, updatedAt: true },
  });

  const cityMap = new Map<string, Date>();
  const propertyPages: MetadataRoute.Sitemap = properties.map((p) => {
    const city = encodeURIComponent(p.city.toLowerCase());
    cityMap.set(p.city, p.updatedAt);
    return {
      url: `${base}/properties/${city}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  const cityPages: MetadataRoute.Sitemap = Array.from(cityMap.entries()).map(([city]) => ({
    url: `${base}/properties/${encodeURIComponent(city.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...propertyPages];
}
