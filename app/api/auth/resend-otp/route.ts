import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRequestIp } from "@/lib/rate-limiter";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/africastalking";
import { otpEmail } from "@/lib/emails/templates";

const resendLimiter = rateLimit({ max: 3, windowMs: 60_000 });

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const { allowed } = resendLimiter(getRequestIp(req));
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { email, phone } = await req.json();

    const identifier = email || phone;
    if (!identifier) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    const user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const otpType = email ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";

    await prisma.otpToken.updateMany({
      where: { identifier, type: otpType, usedAt: null },
      data: { usedAt: new Date() },
    });

    const otp = generateOtp();
    await prisma.otpToken.create({
      data: {
        identifier,
        token: otp,
        type: otpType,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    if (email) {
      await sendEmail(
        email,
        "Verify your email - All Property Link",
        otpEmail({ otp, destination: email })
      );
    }

    if (phone) {
      await sendSms(phone, `Your All Property Link OTP is: ${otp}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    );
  }
}
