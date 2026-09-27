"use server";

import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import {
  deleteService as deleteServiceFn,
  restoreService as restoreServiceFn,
  purgeService as purgeServiceFn,
} from "@/lib/services/service";

const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";

function isRedirect(err: unknown): boolean {
  return err instanceof Error && "digest" in err && String((err as Error & { digest: string }).digest).startsWith(REDIRECT_ERROR_CODE);
}

function ok() {
  return { success: true } as const;
}

function fail(error: string) {
  return { success: false, error } as const;
}

function revalidateServices() {
  revalidatePath("/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
}

export async function deleteService(id: string) {
  try {
    await requireAuth();
    const result = await deleteServiceFn(id);
    if (!result.success) return result;
    revalidateServices();
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to delete service");
  }
}

export async function restoreService(id: string) {
  try {
    await requireAuth();
    const result = await restoreServiceFn(id);
    if (!result.success) return result;
    revalidateServices();
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to restore service");
  }
}

export async function purgeService(id: string, confirmTitle: string) {
  try {
    await requireAuth();
    const result = await purgeServiceFn(id, confirmTitle);
    if (!result.success) return result;
    revalidateServices();
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to permanently delete service");
  }
}
