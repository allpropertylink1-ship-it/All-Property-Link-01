"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { inquirySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function sendInquiry(propertyId: string, formData: FormData) {
  const raw: Record<string, unknown> = {};
  Array.from(formData.entries()).forEach(([key, value]) => { raw[key] = value; });

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors as unknown as string };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, deletedAt: null },
    select: { id: true, agentId: true, title: true },
  });
  if (!property) return { success: false, error: "Property not found" };

  const session = await requireAuth().catch(() => null);
  const data = parsed.data;

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId: session ? (session.user as { id: string }).id : null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    },
  });

  if (property.agentId) {
    await prisma.notification.create({
      data: {
        userId: property.agentId,
        title: "New Inquiry",
        message: `${data.name} sent an inquiry about "${property.title}"`,
        type: "INQUIRY",
        link: `/dashboard/inquiries/${inquiry.id}`,
      } as Prisma.NotificationUncheckedCreateInput,
    });
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function respondToInquiry(id: string, responseMessage: string, responseType: string) {
  const session = await requireAuth();
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: { select: { agentId: true } } },
  });
  if (!inquiry) return { success: false, error: "Inquiry not found" };

  if (inquiry.property.agentId !== (session.user as { id: string }).id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.inquiry.update({
    where: { id },
    data: {
      responseMessage,
      responseType: responseType as "EMAIL" | "WHATSAPP" | "PHONE",
      status: "RESPONDED",
      respondedAt: new Date(),
    },
  });

  if (inquiry.userId) {
    await prisma.notification.create({
      data: {
        userId: inquiry.userId,
        title: "Inquiry Response",
        message: "You received a response to your inquiry",
        type: "INQUIRY",
        link: `/properties/${inquiry.propertyId}`,
      } as Prisma.NotificationUncheckedCreateInput,
    });
  }

  revalidatePath("/dashboard/inquiries");
  return { success: true };
}

export async function closeInquiry(id: string) {
  const session = await requireAuth();
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: { select: { agentId: true } } },
  });
  if (!inquiry) return { success: false, error: "Inquiry not found" };

  if (inquiry.property.agentId !== (session.user as { id: string }).id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.inquiry.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  revalidatePath("/dashboard/inquiries");
  return { success: true };
}
