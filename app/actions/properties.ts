"use server";

import { requireAuth } from "@/lib/auth-utils";
import { propertySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { withRateLimit } from "@/lib/rate-limiter";

const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";

function isRedirect(err: unknown): boolean {
  return err instanceof Error && "digest" in err && String((err as Error & { digest: string }).digest).startsWith(REDIRECT_ERROR_CODE);
}
import {
  createProperty as createPropertyService,
  updateProperty as updatePropertyService,
  deleteProperty as deletePropertyService,
  publishProperty as publishPropertyService,
  rejectProperty as rejectPropertyService,
} from "@/lib/services/property";

function parseForm(formData: FormData) {
  const raw: Record<string, unknown> = {};
  Array.from(formData.entries()).forEach(([key, value]) => { raw[key] = value; });
  if (typeof raw.features === "string") { raw.features = raw.features.split(",").map((s) => s.trim()).filter(Boolean); }
  if (typeof raw.images === "string") { try { raw.images = JSON.parse(raw.images); } catch { raw.images = []; } }
  if (raw.listingPurpose === "") raw.listingPurpose = undefined;
  return raw;
}

function ok(data?: Record<string, unknown>) {
  return { success: true, ...data } as const;
}

function fail(error: string) {
  return { success: false, error } as const;
}

export async function createProperty(formData: FormData) {
  try {
    const { allowed } = await withRateLimit({ max: 10, windowMs: 60_000 });
    if (!allowed) return fail("Too many requests. Try again later.");
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const kycStatus = (session.user as { kycStatus?: string }).kycStatus;
    if (kycStatus !== "VERIFIED" && kycStatus !== "NONE") {
      return fail("KYC verification required to post listings.");
    }
    const parsed = propertySchema.safeParse(parseForm(formData));
    if (!parsed.success) return fail(Object.values(parsed.error.flatten().fieldErrors).flat().join(", "));

    await createPropertyService(parsed.data, userId);
    revalidatePath("/properties");
    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard");
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to create listing");
  }
}

export async function updateProperty(id: string, formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role: string }).role;
    const parsed = propertySchema.safeParse(parseForm(formData));
    if (!parsed.success) return fail(Object.values(parsed.error.flatten().fieldErrors).flat().join(", "));

    const result = await updatePropertyService(id, parsed.data, userId, userRole);
    if (!result.success) return result;

    revalidatePath("/properties");
    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard");
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to update listing");
  }
}

export async function deleteProperty(id: string) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role: string }).role;

    const result = await deletePropertyService(id, userId, userRole);
    if (!result.success) return result;

    revalidatePath("/properties");
    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard");
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to delete listing");
  }
}

export async function publishProperty(id: string) {
  try {
    const session = await requireAuth();
    const role = (session.user as { role: string }).role;
    if (role !== "ADMIN") return fail("Unauthorized");

    await publishPropertyService(id);
    revalidatePath("/properties");
    revalidatePath("/admin");
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to publish listing");
  }
}

export async function rejectProperty(id: string, reason: string) {
  try {
    const session = await requireAuth();
    const role = (session.user as { role: string }).role;
    const userId = (session.user as { id: string }).id;
    if (role !== "ADMIN") return fail("Unauthorized");

    await rejectPropertyService(id, reason, userId);
    revalidatePath("/properties");
    revalidatePath("/admin");
    return ok();
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err instanceof Error ? err.message : "Failed to reject listing");
  }
}
