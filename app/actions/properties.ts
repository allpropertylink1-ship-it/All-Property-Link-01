"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$|(-)+/g, "$1");
}

async function uniqueSlug(base: string) {
  let slug = base, i = 1;
  while (await prisma.property.findUnique({ where: { slug } })) slug = `${base}-${i++}`;
  return slug;
}

function dataToCreate(data: PropertyInput, extra: Record<string, unknown>) {
  return {
    title: data.title, description: data.description, price: data.price,
    currency: data.currency, propertyType: data.propertyType, status: data.status,
    address: data.address, city: data.city, region: data.region, country: data.country,
    bedrooms: data.bedrooms, bathrooms: data.bathrooms, area: data.area,
    latitude: data.latitude, longitude: data.longitude,
    features: data.features ?? [], seoTitle: data.seoTitle, seoDescription: data.seoDescription,
    images: (data.images ?? []) as Prisma.InputJsonValue,
    ...extra,
  } as Prisma.PropertyUncheckedCreateInput;
}

function dataToUpdate(data: PropertyInput, extra: Record<string, unknown>) {
  return {
    title: data.title, description: data.description, price: data.price,
    currency: data.currency, propertyType: data.propertyType, status: data.status,
    address: data.address, city: data.city, region: data.region, country: data.country,
    bedrooms: data.bedrooms, bathrooms: data.bathrooms, area: data.area,
    latitude: data.latitude, longitude: data.longitude,
    features: data.features ?? [], seoTitle: data.seoTitle, seoDescription: data.seoDescription,
    images: (data.images ?? []) as Prisma.InputJsonValue,
    ...extra,
  } as Prisma.PropertyUncheckedUpdateInput;
}

function isAdmin(session: unknown) {
  return (session as { user: { role: string } }).user.role === "ADMIN";
}

function uid(session: unknown) {
  return (session as { user: { id: string } }).user.id;
}

function parseForm(formData: FormData) {
  const raw: Record<string, unknown> = {};
  Array.from(formData.entries()).forEach(([key, value]) => { raw[key] = value; });
  if (typeof raw.features === "string") { try { raw.features = JSON.parse(raw.features); } catch { raw.features = []; } }
  if (typeof raw.images === "string") { try { raw.images = JSON.parse(raw.images); } catch { raw.images = []; } }
  return raw;
}

export async function createProperty(formData: FormData) {
  const session = await requireAuth();
  const parsed = propertySchema.safeParse(parseForm(formData));
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };

  const slug = await uniqueSlug(slugify(parsed.data.title));
  await prisma.property.create({
    data: dataToCreate(parsed.data, {
      slug, agentId: uid(session), moderationStatus: "DRAFT", isPublished: false, version: 1,
    }),
  });
  revalidatePath("/properties"); revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProperty(id: string, formData: FormData) {
  const session = await requireAuth();
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Property not found" };

  const role = (session.user as { role: string }).role;
  if (existing.agentId !== uid(session) && role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const parsed = propertySchema.safeParse(parseForm(formData));
  if (!parsed.success) return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };

  try {
    await prisma.property.update({
      where: { id, version: existing.version },
      data: dataToUpdate(parsed.data, { version: { increment: 1 } }),
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { success: false, error: "Conflict: modified by another user. Refresh and try again." };
    }
    throw e;
  }
  revalidatePath("/properties"); revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProperty(id: string) {
  const session = await requireAuth();
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Property not found" };
  if (existing.agentId !== uid(session) && !isAdmin(session)) return { success: false, error: "Unauthorized" };
  await prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/properties"); revalidatePath("/dashboard");
  return { success: true };
}

export async function publishProperty(id: string) {
  const session = await requireAuth();
  if (isAdmin(session)) {
    await prisma.property.update({
      where: { id },
      data: { isPublished: true, moderationStatus: "APPROVED", publishedAt: new Date() },
    });
    revalidatePath("/properties"); revalidatePath("/admin");
  }
  return { success: false, error: "Unauthorized" };
}

export async function rejectProperty(id: string, reason: string) {
  const session = await requireAuth();
  if (isAdmin(session)) {
    await prisma.property.update({
      where: { id },
      data: { moderationStatus: "REJECTED", rejectionReason: reason },
    });
    revalidatePath("/properties"); revalidatePath("/admin");
  }
  return { success: false, error: "Unauthorized" };
}
