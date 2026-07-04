"use server";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

export async function getProperties(filter: string, page: number) {
  const { prisma } = await import("@/lib/prisma");
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);

  const where: Record<string, unknown> = { deletedAt: null };
  if (filter === "pending") {
    where.moderationStatus = "PENDING_REVIEW";
  } else if (filter === "approved") {
    where.moderationStatus = "APPROVED";
    where.isPublished = true;
  } else if (filter === "rejected") {
    where.moderationStatus = "REJECTED";
  } else if (filter === "expired") {
    where.moderationStatus = "EXPIRED";
  }

  const [count, data] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        propertyType: true,
        city: true,
        moderationStatus: true,
        isPublished: true,
        createdAt: true,
        agent: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
  ]);

  return { total: count, properties: data };
}

export async function approveProperty(propertyId: string) {
  const { prisma } = await import("@/lib/prisma");
  const { requireRole } = await import("@/lib/auth-utils");
  const session = await requireRole(["ADMIN"]);

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        moderationStatus: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: (session.user as SessionUser).id,
        isPublished: true,
        publishedAt: new Date(),
        version: { increment: 1 },
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to approve property" };
  }
}

export async function rejectProperty(propertyId: string, reason: string = "") {
  const { prisma } = await import("@/lib/prisma");
  const { requireRole } = await import("@/lib/auth-utils");
  const session = await requireRole(["ADMIN"]);

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        moderationStatus: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: (session.user as SessionUser).id,
        rejectionReason: reason,
        version: { increment: 1 },
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reject property" };
  }
}

export async function togglePublish(propertyId: string, publish: boolean) {
  const { prisma } = await import("@/lib/prisma");
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : undefined,
        version: { increment: 1 },
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update publish status" };
  }
}

export async function saveSettings(formData: FormData) {
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);

  const data = {
    platformName: formData.get("platformName"),
    platformUrl: formData.get("platformUrl"),
    contactEmail: formData.get("contactEmail"),
    fromName: formData.get("fromName"),
    fromEmail: formData.get("fromEmail"),
    replyTo: formData.get("replyTo"),
    businessNumber: formData.get("businessNumber"),
    responseTime: formData.get("responseTime"),
  };

  console.log("Settings saved:", data);
}

export async function viewProperty(_propertyId: string) {
  const { requireRole } = await import("@/lib/auth-utils");
  await requireRole(["ADMIN"]);

  return { success: true };
}
