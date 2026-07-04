"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function getUsers(search: string, page: number) {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    return { count: 0, users: [], error: "Unauthorized" };
  }

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [count, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        avatar: true,
      },
    }),
  ]);

  return { count, users: data };
}

export async function updateUserRole(userId: string, role: string) {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as "APPLICANT" | "AGENT" | "ADMIN" },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user role" };
  }
}

export async function toggleUserStatus(userId: string, suspend: boolean) {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: !suspend,
        phoneVerified: !suspend,
        lockedUntil: suspend ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user status" };
  }
}

export async function deleteUser(userId: string) {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete user" };
  }
}
