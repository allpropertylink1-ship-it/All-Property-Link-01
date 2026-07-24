"use server";

export async function getProperties(page: number) {
  const { prisma } = await import("@/lib/prisma");
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);

  const where: Record<string, unknown> = { deletedAt: null };

  const [count, data] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        propertyType: true,
        city: true,
        moderationStatus: true,
        isPublished: true,
        createdAt: true,
        agent: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
  ]);

  return {
    total: count,
    properties: data.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      currency: p.currency,
      propertyType: p.propertyType,
      city: p.city,
      moderationStatus: p.moderationStatus,
      isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(),
      agent: p.agent,
    })),
  };
}
