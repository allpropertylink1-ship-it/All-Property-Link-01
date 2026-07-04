"use server";

import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import {
  toggleFavorite as toggleFavoriteService,
  getFavorites as getFavoritesService,
} from "@/lib/services/favorites";

export async function toggleFavorite(propertyId: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const result = await toggleFavoriteService(propertyId, userId);

  revalidatePath(`/properties/${propertyId}`);
  return result;
}

export async function getFavorites() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  return getFavoritesService(userId);
}
