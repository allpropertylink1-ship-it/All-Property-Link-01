"use server";

import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limiter";

export async function checkAccountLocked(email: string): Promise<{ locked: boolean; minutesRemaining?: number }> {
  const { allowed } = await withRateLimit({ max: 10, windowMs: 60_000 });
  if (!allowed) return { locked: false };
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
