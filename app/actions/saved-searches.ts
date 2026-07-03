"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function saveSearch(name: string, filters: object) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  await prisma.savedSearch.create({
    data: {
      name,
      filters: filters as Prisma.InputJsonValue,
      userId,
    },
  });

  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

export async function deleteSavedSearch(id: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const search = await prisma.savedSearch.findUnique({ where: { id } });
  if (!search) return { success: false, error: "Saved search not found" };
  if (search.userId !== userId) return { success: false, error: "Unauthorized" };

  await prisma.savedSearch.delete({ where: { id } });

  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

export async function getSavedSearches() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const searches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return searches.map((s) => ({
    ...s,
    filters: s.filters as Record<string, unknown>,
  }));
}
