import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyInterest, isAgent, agentLicense, agencyName, notificationPrefs, onboardingComplete } = await _req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        propertyInterest: propertyInterest || [],
        isAgent: isAgent || false,
        agentLicense: agentLicense || null,
        agencyName: agencyName || null,
        notificationPrefs: notificationPrefs || null,
        onboardingComplete: onboardingComplete || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
