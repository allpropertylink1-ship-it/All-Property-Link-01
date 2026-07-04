"use server";

import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import {
  saveSearch as saveSearchService,
  deleteSavedSearch as deleteSavedSearchService,
  getSavedSearches as getSavedSearchesService,
} from "@/lib/services/saved-searches";

export async function saveSearch(name: string, filters: object) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  await saveSearchService(name, filters, userId);
  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

export async function deleteSavedSearch(id: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const result = await deleteSavedSearchService(id, userId);
  if (!result.success) return result;

  revalidatePath("/dashboard/saved-searches");
  return { success: true };
}

export async function getSavedSearches() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  return getSavedSearchesService(userId);
}
