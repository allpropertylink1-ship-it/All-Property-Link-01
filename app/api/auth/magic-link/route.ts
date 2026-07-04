import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRequestIp } from "@/lib/rate-limiter";
import { sendEmail } from "@/lib/resend";
import { magicLinkEmail } from "@/lib/emails/templates";

const magicLinkLimiter = rateLimit({ max: 3, windowMs: 300_000 });

export async function POST(req: Request) {
  try {
    const { allowed } = magicLinkLimiter(getRequestIp(req));
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.magicLinkToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const magicUrl = `${process.env.NEXTAUTH_URL}/auth/verify-magic-link?token=${token}`;

    await sendEmail(
      email,
      "Sign in to All Property Link",
      magicLinkEmail({ magicUrl })
    );

    return NextResponse.json({ success: true, message: "Magic link sent" });
  } catch (error) {
    console.error("[magic-link] Exception:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
