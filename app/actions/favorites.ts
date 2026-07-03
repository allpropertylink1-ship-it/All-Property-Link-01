"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(propertyId: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    const property = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null },
      select: { id: true },
    });
    if (!property) return { success: false, error: "Property not found" };

    await prisma.favorite.create({
      data: { userId, propertyId },
    });
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function getFavorites() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          currency: true,
          city: true,
          region: true,
          images: true,
          propertyType: true,
          createdAt: true,
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
