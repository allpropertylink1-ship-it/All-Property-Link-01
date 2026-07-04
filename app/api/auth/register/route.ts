import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRequestIp } from "@/lib/rate-limiter";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/africastalking";
import { otpEmail } from "@/lib/emails/templates";
import { isDisposableEmail } from "@/lib/email-validation";

const registerLimiter = rateLimit({ max: 3, windowMs: 60_000 });

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskEmail(email: string): string {
  return email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
}

function maskPhone(phone: string): string {
  return phone.replace(/(.{5})(.*)/, "$1***");
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
      if (isDisposableEmail(email)) {
        return NextResponse.json(
          { error: "Please use a permanent email address" },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        if (existing.emailVerified) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }

        const otp = generateOtp();
        await prisma.otpToken.updateMany({
          where: { identifier: email, type: "EMAIL_VERIFICATION", usedAt: null },
          data: { usedAt: new Date() },
        });
        await prisma.otpToken.create({
          data: {
            identifier: email,
            token: otp,
            type: "EMAIL_VERIFICATION",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        const emailResult = await sendEmail(
          email,
          "Verify your email - All Property Link",
          otpEmail({ otp, destination: email })
        );

        if (!emailResult.success) {
          console.error("[register] Email delivery failed for existing user:", emailResult.error);
        }

        return NextResponse.json(
          {
            success: true,
            requiresOtp: true,
            existingUser: true,
            userId: existing.id,
            destination: "email",
            maskedDestination: maskEmail(email),
            emailFailed: !emailResult.success,
            emailError: emailResult.success ? undefined : emailResult.error,
            otpFallback: !emailResult.success ? otp : undefined,
          },
          { status: 200 }
        );
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        if (existingPhone.phoneVerified) {
          return NextResponse.json(
            { error: "Phone number already registered" },
            { status: 409 }
          );
        }

        const otp = generateOtp();
        await prisma.otpToken.updateMany({
          where: { identifier: phone, type: "PHONE_VERIFICATION", usedAt: null },
          data: { usedAt: new Date() },
        });
        await prisma.otpToken.create({
          data: {
            identifier: phone,
            token: otp,
            type: "PHONE_VERIFICATION",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        const smsResult = await sendSms(phone, `Your All Property Link OTP is: ${otp}`);

        return NextResponse.json(
          {
            success: true,
            requiresOtp: true,
            existingUser: true,
            userId: existingPhone.id,
            destination: "phone",
            maskedDestination: maskPhone(phone),
            smsFailed: !smsResult.success,
            otpFallback: !smsResult.success ? otp : undefined,
          },
          { status: 200 }
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
        emailVerified: email ? null : new Date(),
        phoneVerified: !phone,
      },
    });

    let emailFailed = false;
    let emailError: string | undefined;
    let otpFallback: string | undefined;

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

      const emailResult = await sendEmail(
        email,
        "Verify your email - All Property Link",
        otpEmail({ otp, destination: email })
      );

      if (!emailResult.success) {
        console.error("[register] Email delivery failed:", emailResult.error);
        emailFailed = true;
        emailError = emailResult.error;
        otpFallback = otp;
      }
    }

    if (phone) {
      const otp = generateOtp();
      await prisma.otpToken.create({
        data: {
          identifier: phone,
          token: otp,
          type: "PHONE_VERIFICATION",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      const smsResult = await sendSms(phone, `Your All Property Link OTP is: ${otp}`);

      if (!smsResult.success) {
        console.error("[register] SMS delivery failed");
        otpFallback = otp;
      }
    }

    return NextResponse.json(
      {
        success: true,
        requiresOtp: !!email || !!phone,
        userId: user.id,
        destination: email ? "email" : "phone",
        maskedDestination: email ? maskEmail(email) : phone ? maskPhone(phone) : "",
        emailFailed,
        emailError,
        otpFallback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register] Exception:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
