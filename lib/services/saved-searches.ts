import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function saveSearch(name: string, filters: object, userId: string) {
  await prisma.savedSearch.create({
    data: {
      name,
      filters: filters as Prisma.InputJsonValue,
      userId,
    },
  });
}

export async function deleteSavedSearch(id: string, userId: string) {
  const search = await prisma.savedSearch.findUnique({ where: { id } });
  if (!search) return { success: false, error: "Saved search not found" } as const;
  if (search.userId !== userId) return { success: false, error: "Unauthorized" } as const;

  await prisma.savedSearch.delete({ where: { id } });
  return { success: true } as const;
}

export async function getSavedSearches(userId: string) {
  const searches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return searches.map((s) => ({
    ...s,
    filters: s.filters as Record<string, unknown>,
  }));
}
