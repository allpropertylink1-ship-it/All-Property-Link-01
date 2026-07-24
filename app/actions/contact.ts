"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { contactFormEmail } from "@/lib/emails/templates";

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

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", email: { not: null } },
      select: { email: true },
    });
    for (const admin of admins) {
      if (admin.email) {
        await sendEmail(admin.email, "Contact Form Submission", contactFormEmail({ name, email, phone, subject, message }));
      }
    }

    revalidatePath("/contact");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}