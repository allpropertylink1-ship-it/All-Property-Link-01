"use server";

import { prisma } from "@/lib/prisma";

export async function checkAccountLocked(email: string): Promise<{ locked: boolean; minutesRemaining?: number }> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  });

  if (!user?.lockedUntil) return { locked: false };

  const now = new Date();
  if (user.lockedUntil <= now) return { locked: false };

  const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000);
  return { locked: true, minutesRemaining };
}
