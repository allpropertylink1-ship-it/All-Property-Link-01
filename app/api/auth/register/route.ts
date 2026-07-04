import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRequestIp } from "@/lib/rate-limiter";
import { sendEmail } from "@/lib/resend";
import { otpEmail } from "@/lib/emails/templates";

const registerLimiter = rateLimit({ max: 3, windowMs: 60_000 });

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const { allowed } = registerLimiter(getRequestIp(req));
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Try again later." },
        { status: 429 }
      );
    }

    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        passwordHash,
        emailVerified: email ? null : undefined,
        phoneVerified: !phone,
      },
    });

    if (email) {
      const otp = generateOtp();
      await prisma.otpToken.create({
        data: {
          identifier: email,
          token: otp,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await sendEmail(
        email,
        "Verify your email - All Property Link",
        otpEmail({ otp, destination: email })
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresOtp: !!email,
        userId: user.id,
        destination: email ? "email" : "phone",
        maskedDestination: email
          ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
          : phone?.replace(/(.{5})(.*)/, "$1***"),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
