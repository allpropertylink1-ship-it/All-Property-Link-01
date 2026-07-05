"use server";

import { requireAuth } from "@/lib/auth-utils";
import { propertySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { withRateLimit } from "@/lib/rate-limiter";
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
  if (typeof raw.features === "string") { try { raw.features = JSON.parse(raw.features); } catch { raw.features = []; } }
  if (typeof raw.images === "string") { try { raw.images = JSON.parse(raw.images); } catch { raw.images = []; } }
  return raw;
}

export async function createProperty(formData: FormData) {
  const { allowed } = await withRateLimit({ max: 10, windowMs: 60_000 });
  if (!allowed) return { success: false, error: "Too many requests. Try again later." };
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;
  const kycStatus = (session.user as { kycStatus?: string }).kycStatus;
  if (kycStatus !== "VERIFIED") {
    return { success: false, error: "KYC verification required to post listings. Complete your KYC verification first." };
  }
  const parsed = propertySchema.safeParse(parseForm(formData));
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };

  await createPropertyService(parsed.data, userId);
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProperty(id: string, formData: FormData) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;
  const userRole = (session.user as { role: string }).role;
  const parsed = propertySchema.safeParse(parseForm(formData));
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };

  const result = await updatePropertyService(id, parsed.data, userId, userRole);
  if (!result.success) return result;

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProperty(id: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;
  const userRole = (session.user as { role: string }).role;

  const result = await deletePropertyService(id, userId, userRole);
  if (!result.success) return result;

  revalidatePath("/properties");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function publishProperty(id: string) {
  const session = await requireAuth();
  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN") return { success: false, error: "Unauthorized" };

  await publishPropertyService(id);
  revalidatePath("/properties");
  revalidatePath("/admin");
  return { success: true };
}

export async function rejectProperty(id: string, reason: string) {
  const session = await requireAuth();
  const role = (session.user as { role: string }).role;
  const userId = (session.user as { id: string }).id;
  if (role !== "ADMIN") return { success: false, error: "Unauthorized" };

  await rejectPropertyService(id, reason, userId);
  revalidatePath("/properties");
  revalidatePath("/admin");
  return { success: true };
}
