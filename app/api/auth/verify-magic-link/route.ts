import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const record = await prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired magic link" },
        { status: 400 }
      );
    }

    await prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      valid: true,
      email: record.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
