import { prisma } from "@/lib/prisma";

export async function toggleFavorite(propertyId: string, userId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { added: false } as const;
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });
  if (!property) return { success: false, error: "Property not found" } as const;

  await prisma.favorite.create({ data: { userId, propertyId } });
  return { added: true } as const;
}

export async function getFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      property: {
        select: {
          id: true, slug: true, title: true, price: true, currency: true,
          city: true, region: true, images: true, propertyType: true, createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((f) => ({
    ...f,
    property: { ...f.property, price: Number(f.property.price) },
  }));
}
