import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface PropertyFilters {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface PropertyImage {
  url: string;
  alt?: string;
  order?: number;
  isPrimary?: boolean;
}

export async function getProperties(filters: PropertyFilters = {}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.PropertyWhereInput = {
    moderationStatus: "APPROVED",
    isPublished: true,
    deletedAt: null,
  };

  if (filters.city) where.city = filters.city;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (filters.propertyType) where.propertyType = filters.propertyType as any;
  if (filters.bedrooms) where.bedrooms = filters.bedrooms;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
      { city: { contains: filters.query, mode: "insensitive" } },
      { region: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        propertyType: true,
        city: true,
        region: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        images: true,
        isFeatured: true,
        createdAt: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: properties.map((p) => ({ ...p, price: Number(p.price) })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug, deletedAt: null },
    include: { agent: { select: { firstName: true, lastName: true, phone: true, avatar: true } } },
  });
  if (!property) return null;
  return { ...property, price: Number(property.price) };
}

export async function getCities() {
  return prisma.property.groupBy({
    by: ["city"],
    where: { moderationStatus: "APPROVED", isPublished: true, deletedAt: null },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
  });
}
