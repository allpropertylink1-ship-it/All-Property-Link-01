"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function sendContactMessage(formData: FormData) {
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