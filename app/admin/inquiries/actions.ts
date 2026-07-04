"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function getInquiries(filter: string, page: number) {
  await requireRole(["ADMIN"]);

  const where: Record<string, unknown> = {};

  if (filter === "pending") {
    where.status = "PENDING";
  } else if (filter === "read") {
    where.status = "READ";
  } else if (filter === "responded") {
    where.status = "RESPONDED";
  } else if (filter === "closed") {
    where.status = "CLOSED";
  }

  const [count, data] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        respondedAt: true,
        responseMessage: true,
        responseType: true,
        createdAt: true,
        property: { select: { title: true, id: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return { total: count, data };
}

export async function respondToInquiry(inquiryId: string) {
  await requireRole(["ADMIN"]);

  try {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: "RESPONDED",
        responseMessage: "Thank you for your inquiry. We will get back to you shortly.",
        responseType: "EMAIL",
        respondedAt: new Date(),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to respond to inquiry" };
  }
}

export async function closeInquiry(inquiryId: string) {
  await requireRole(["ADMIN"]);

  try {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: "CLOSED",
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to close inquiry" };
  }
}

export async function viewInquiry(_inquiryId: string) {
  return { success: true };
}
