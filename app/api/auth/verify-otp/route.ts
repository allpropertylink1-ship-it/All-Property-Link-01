import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails/templates";

export async function POST(req: Request) {
  try {
    const { email, phone, otp } = await req.json();

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    const identifier = email || phone;
    if (!identifier) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    const otpType = email ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION";

    const token = await prisma.otpToken.findFirst({
      where: {
        identifier,
        type: otpType,
        token: otp,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    await prisma.otpToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    if (email) {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });

      const user = await prisma.user.findUnique({
        where: { email },
        select: { firstName: true },
      });

      if (user) {
        sendEmail(
          email,
          "Welcome to All Property Link!",
          welcomeEmail(user.firstName)
        );
      }
    } else if (phone) {
      const user = await prisma.user.findFirst({
        where: { phone },
        select: { id: true },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
