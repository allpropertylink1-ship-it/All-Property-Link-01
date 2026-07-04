"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limiter";

export async function sendContactMessage(formData: FormData) {
  const { allowed } = await withRateLimit({ max: 3, windowMs: 300_000 });
  if (!allowed) return { success: false, error: "Too many requests. Try again later." };

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const subject = formData.get("subject") as string | null;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { success: false, error: "Name, email, and message are required" };
    }

    await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || undefined,
        message: `[${subject || "General"}] ${message}`,
        status: "PENDING",
      },
    });

    revalidatePath("/contact");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}