"use server";

import { requireAuth } from "@/lib/auth-utils";
import { inquirySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  sendInquiry as sendInquiryService,
  respondToInquiry as respondToInquiryService,
  closeInquiry as closeInquiryService,
} from "@/lib/services/inquiries";

export async function sendInquiry(propertyId: string, formData: FormData) {
  const raw: Record<string, unknown> = {};
  Array.from(formData.entries()).forEach(([key, value]) => { raw[key] = value; });

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };
  }

  const session = await requireAuth().catch(() => null);
  const userId = session ? (session.user as { id: string }).id : null;

  const result = await sendInquiryService(propertyId, parsed.data, userId);
  if (!result.success) return result;

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function respondToInquiry(id: string, responseMessage: string, responseType: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const result = await respondToInquiryService(id, responseMessage, responseType, userId);
  if (!result.success) return result;

  revalidatePath("/dashboard/inquiries");
  return { success: true };
}

export async function closeInquiry(id: string) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const result = await closeInquiryService(id, userId);
  if (!result.success) return result;

  revalidatePath("/dashboard/inquiries");
  return { success: true };
}
