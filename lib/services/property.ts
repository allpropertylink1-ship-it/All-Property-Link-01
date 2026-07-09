import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { PropertyInput } from "@/lib/validations";
import { sendEmail } from "@/lib/resend";
import { propertyApprovedEmail, propertyRejectedEmail } from "@/lib/emails/templates";

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

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$|(-)+/g, "$1");
}

async function uniqueSlug(base: string) {
  let slug = base, i = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

const propertyFields = (data: PropertyInput) => ({
  title: data.title, description: data.description, price: data.price,
  currency: data.currency, propertyType: data.propertyType, status: data.status,
  address: data.address, city: data.city, region: data.region, country: data.country,
  bedrooms: data.bedrooms, bathrooms: data.bathrooms, area: data.area,
  latitude: data.latitude, longitude: data.longitude,
  features: data.features ?? [], seoTitle: data.seoTitle, seoDescription: data.seoDescription,
  images: (data.images ?? []) as Prisma.InputJsonValue,
})

export async function getProperties(filters: PropertyFilters = {}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.PropertyWhereInput = {
    deletedAt: null,
  };

  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType as Prisma.EnumPropertyTypeFilter["equals"];
  if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };
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
        id: true, slug: true, title: true, price: true, currency: true,
        propertyType: true, status: true, city: true, region: true, bedrooms: true,
        bathrooms: true, area: true, images: true, isFeatured: true, createdAt: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: properties.map(({ status: _, ...p }) => ({ ...p, price: Number(p.price), isRent: _ === "RENTED" })),
    total, page, pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findFirst({
    where: { slug, deletedAt: null },
    include: { agent: { select: { firstName: true, lastName: true, phone: true, email: true, avatar: true, businessLogo: true, companyName: true, category: true, specialties: true, website: true } } },
  });
  if (!property) return null;
  return { ...property, price: Number(property.price) };
}

export async function getCities() {
  return prisma.property.groupBy({
    by: ["city"],
    where: { deletedAt: null },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
  });
}

export async function createProperty(data: PropertyInput, userId: string) {
  const slug = await uniqueSlug(slugify(data.title));
  return prisma.property.create({
    data: { ...propertyFields(data), slug, agentId: userId, moderationStatus: "APPROVED", isPublished: true, publishedAt: new Date(), version: 1 },
  });
}

export async function updateProperty(
  id: string,
  data: PropertyInput,
  userId: string,
  userRole: string,
) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Property not found" } as const;
  if (existing.agentId !== userId && userRole !== "ADMIN") {
    return { success: false, error: "Unauthorized" } as const;
  }

  try {
    await prisma.property.update({
      where: { id, version: existing.version },
      data: { ...propertyFields(data), version: { increment: 1 } },
    });
    return { success: true } as const;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { success: false, error: "Conflict: modified by another user. Refresh and try again." } as const;
    }
    throw e;
  }
}

export async function deleteProperty(id: string, userId: string, userRole: string) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Property not found" } as const;
  if (existing.agentId !== userId && userRole !== "ADMIN") {
    return { success: false, error: "Unauthorized" } as const;
  }
  await prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
  return { success: true } as const;
}

export async function approveProperty(id: string, reviewerId: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, agentId: true },
  });
  if (!property) return;

  await prisma.property.update({
    where: { id },
    data: {
      moderationStatus: "APPROVED",
      isPublished: true,
      publishedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      version: { increment: 1 },
    },
  });

  if (property.agentId) {
    const agent = await prisma.user.findUnique({
      where: { id: property.agentId },
      select: { email: true },
    });
    if (agent?.email) {
      await sendEmail(
        agent.email,
        `Your property "${property.title}" has been approved`,
        propertyApprovedEmail({ title: property.title }),
      );
    }
  }
}

export async function rejectProperty(id: string, reason: string, reviewerId: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, agentId: true },
  });
  if (!property) return;

  await prisma.property.update({
    where: { id },
    data: {
      moderationStatus: "REJECTED",
      rejectionReason: reason,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      version: { increment: 1 },
    },
  });

  if (property.agentId) {
    const agent = await prisma.user.findUnique({
      where: { id: property.agentId },
      select: { email: true },
    });
    if (agent?.email) {
      await sendEmail(
        agent.email,
        `Update on "${property.title}"`,
        propertyRejectedEmail({ title: property.title, reason }),
      );
    }
  }
}

export async function publishProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, agentId: true },
  });
  if (!property) return;

  await prisma.property.update({
    where: { id },
    data: { isPublished: true, moderationStatus: "APPROVED", publishedAt: new Date() },
  });

  if (property.agentId) {
    const agent = await prisma.user.findUnique({
      where: { id: property.agentId },
      select: { email: true },
    });
    if (agent?.email) {
      await sendEmail(
        agent.email,
        `Your property "${property.title}" is now live`,
        propertyApprovedEmail({ title: property.title }),
      );
    }
  }
}
