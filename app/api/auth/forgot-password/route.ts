import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { rateLimit, getRequestIp } from "@/lib/rate-limiter";
import { resetPasswordEmail } from "@/lib/emails/templates";

const forgotLimiter = rateLimit({ max: 3, windowMs: 300_000 });

export async function POST(req: Request) {
  const { allowed } = forgotLimiter(getRequestIp(req));
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://allpropertylink.vercel.app"}/auth/reset-password?token=${token}`;
      await sendEmail(email, "Reset your All Property Link password", resetPasswordEmail({ resetUrl }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[forgot-password] Exception:", error);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}
